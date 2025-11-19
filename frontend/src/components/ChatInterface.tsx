import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { API_BASE_URL } from '../config';
import type { ChatApiMessage, ChatSession, Message, User } from '../types';

 type ChatCreateResponse = {
  chat: ChatApiMessage;
  aiResponse: string;
  session: ChatSession;
};

interface ChatInterfaceProps {
  token: string;
  user: User;
  onLogout: () => void;
}

function ChatInterface({ token, user, onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const appendAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      content,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  // Fetch or create chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setSessionsLoading(true);
        setSessionsError(null);

        const response = await fetch(`${API_BASE_URL}/api/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          throw new Error(data.message || 'Failed to load chat sessions');
        }

        const data = (await response.json()) as ChatSession[];

        if (data.length === 0) {
          // Create a first session automatically
          const createResponse = await fetch(`${API_BASE_URL}/api/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: 'New chat' }),
          });

          if (!createResponse.ok) {
            const createData = (await createResponse.json()) as { message?: string };
            throw new Error(createData.message || 'Failed to create initial chat');
          }

          const created = (await createResponse.json()) as ChatSession;
          setSessions([created]);
          setCurrentSessionId(created._id);
        } else {
          setSessions(data);
          setCurrentSessionId(data[0]._id);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load chat sessions';
        setSessionsError(message);
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, [token]);

  // Load messages for the current session
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentSessionId) {
        return;
      }

      try {
        setLoadingHistory(true);
        setHistoryError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/chats?sessionId=${encodeURIComponent(currentSessionId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          throw new Error(data.message || 'Failed to load chat history');
        }

        const data = (await response.json()) as ChatApiMessage[];
        const mappedMessages: Message[] = data.map((chat) => ({
          id: chat._id,
          content: chat.message,
          role: 'user',
          timestamp: new Date(chat.createdAt),
        }));

        if (mappedMessages.length === 0) {
          setMessages([
            {
              id: 'welcome',
              content: `Hi ${user.username}, ready to dive in?`,
              role: 'assistant',
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages(mappedMessages);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load chat history';
        setHistoryError(message);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [token, currentSessionId]);

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) {
      return;
    }

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content, sessionId: currentSessionId }),
      });

      const data = (await response.json()) as
        | ChatCreateResponse
        | { message?: string };

      if (!response.ok || !('chat' in data)) {
        const errorMessage =
          'message' in data && typeof data.message === 'string'
            ? data.message
            : 'Failed to save message';
        throw new Error(errorMessage);
      }

      const saved = data.chat;
      const aiResponse = data.aiResponse;
      const updatedSession = data.session;

      // Update sessions list (sidebar title / preview) when first message sets topic
      setSessions((prev) =>
        prev.map((session) =>
          session._id === updatedSession._id ? updatedSession : session,
        ),
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? {
                ...msg,
                id: saved._id,
                timestamp: new Date(saved.createdAt),
              }
            : msg,
        ),
      );

      const assistantMessage: Message = {
        id: `assistant-${saved._id}`,
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send message';
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: `Error: ${message}`,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'New chat' }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || 'Failed to create new chat');
      }

      const created = (await response.json()) as ChatSession;
      setSessions((prev) => [created, ...prev]);
      setCurrentSessionId(created._id);
      setMessages([
        {
          id: 'welcome',
          content: `Hi ${user.username}, ready to dive in?`,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create new chat';
      setSessionsError(message);
    }
  };

  const formatSessionTitle = (session: ChatSession) => {
    if (session.title && session.title.trim()) {
      return session.title.trim();
    }
    if (session.lastMessagePreview && session.lastMessagePreview.trim()) {
      const trimmed = session.lastMessagePreview.trim();
      return trimmed.length > 24 ? `${trimmed.slice(0, 24)}…` : trimmed;
    }
    return 'New chat';
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || 'Failed to delete chat');
      }

      setSessions((prev) => prev.filter((s) => s._id !== sessionId));

      // If we deleted the active session, switch to another one or create a new one
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        if (sessions.length > 1) {
          const remaining = sessions.filter((s) => s._id !== sessionId);
          if (remaining.length > 0) {
            setCurrentSessionId(remaining[0]._id);
          }
        } else {
          // No sessions left, create a fresh one
          void handleNewChat();
        }
        setMessages([]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete chat';
      setSessionsError(message);
    }
  };

  return (
    <div className="flex h-screen max-w-5xl mx-auto">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/80">
        <div className="px-3 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">Chats</span>
          <button
            type="button"
            onClick={handleNewChat}
            className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          {sessionsLoading && (
            <p className="px-3 py-2 text-slate-500">Loading chats…</p>
          )}
          {sessionsError && !sessionsLoading && (
            <p className="px-3 py-2 text-red-400 whitespace-pre-wrap">
              {sessionsError}
            </p>
          )}
          {!sessionsLoading && !sessionsError && sessions.length === 0 && (
            <p className="px-3 py-2 text-slate-500 text-xs">No chats yet.</p>
          )}
          {sessions.map((session) => {
            const active = session._id === currentSessionId;
            return (
              <div
                key={session._id}
                className="group flex items-stretch border-b border-slate-900/40 hover:bg-slate-900/70"
              >
                <button
                  type="button"
                  onClick={() => setCurrentSessionId(session._id)}
                  className={`flex-1 text-left px-3 py-2 ${
                    active ? 'bg-slate-900/90 text-slate-100' : 'text-slate-300'
                  }`}
                >
                  <div className="truncate font-medium">
                    {formatSessionTitle(session)}
                  </div>
                  {session.lastMessagePreview && (
                    <div className="truncate text-[11px] text-slate-500">
                      {session.lastMessagePreview}
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDeleteSession(session._id);
                  }}
                  className="px-2 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1">
        <ChatHeader user={user} onLogout={onLogout} />
        {historyError && (
          <div className="px-4 pt-2 text-xs text-red-400 truncate">
            {historyError}
          </div>
        )}
        <ChatMessages messages={messages} isTyping={isTyping && !loadingHistory} />
        <ChatInput
          onSendMessage={handleSendMessage}
          token={token}
          onAddAssistantMessage={appendAssistantMessage}
        />
      </div>
    </div>
  );
}

export default ChatInterface;

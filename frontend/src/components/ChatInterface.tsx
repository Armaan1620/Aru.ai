import { useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { API_BASE_URL } from '../config';
import type { ChatApiMessage, Message, User } from '../types';

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        setHistoryError(null);

        const response = await fetch(`${API_BASE_URL}/api/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
              content:
                "Hello! I'm your AI assistant. Start chatting and your messages will be saved to your account.",
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
  }, [token]);

  const handleSendMessage = async (content: string) => {
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
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || 'Failed to save message');
      }

      const saved = (await response.json()) as ChatApiMessage;

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
    } finally {
      // For now we still show a dummy assistant response to keep the UI lively.
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "(Demo) This is a placeholder AI response. Your message has been saved to your account.",
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 700);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      <ChatHeader user={user} onLogout={onLogout} />
      {historyError && (
        <div className="px-4 pt-2 text-sm text-red-400">
          {historyError}
        </div>
      )}
      <ChatMessages messages={messages} isTyping={isTyping && !loadingHistory} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatInterface;

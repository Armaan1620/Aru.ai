import { useState, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 backdrop-blur-xl bg-slate-900/80 border-t border-slate-700/50 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
          <button className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none resize-none max-h-32 py-2"
            style={{
              minHeight: '2.5rem',
              maxHeight: '8rem',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}

export default ChatInput;

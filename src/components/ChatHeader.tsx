import { Sparkles, Menu } from 'lucide-react';

function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ChatHeader;

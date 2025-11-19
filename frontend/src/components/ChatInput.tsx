import { useState, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  token: string;
  onAddAssistantMessage: (content: string) => void;
}

function ChatInput({ onSendMessage, token, onAddAssistantMessage }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPrompt, setDocPrompt] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

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

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      setImageError('Please select an image file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    if (imagePrompt.trim()) {
      formData.append('prompt', imagePrompt.trim());
    }

    try {
      setImageLoading(true);
      setImageError(null);

      const response = await fetch(`${API_BASE_URL}/api/utils/analyze-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await response.json()) as { analysis?: string; message?: string };

      if (!response.ok || !data.analysis) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      const analysisText = data.analysis ?? '';
      onAddAssistantMessage(analysisText);
      setAttachmentsOpen(false);
      setImageFile(null);
      setImagePrompt('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze image';
      setImageError(message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!docFile) {
      setDocError('Please select a document file first.');
      return;
    }

    const formData = new FormData();
    formData.append('document', docFile);
    if (docPrompt.trim()) {
      formData.append('prompt', docPrompt.trim());
    }

    try {
      setDocLoading(true);
      setDocError(null);

      const response = await fetch(`${API_BASE_URL}/api/utils/analyze-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await response.json()) as { analysis?: string; message?: string };

      if (!response.ok || !data.analysis) {
        throw new Error(data.message || 'Failed to analyze document');
      }

      const analysisText = data.analysis ?? '';
      onAddAssistantMessage(analysisText);
      setAttachmentsOpen(false);
      setDocFile(null);
      setDocPrompt('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze document';
      setDocError(message);
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 backdrop-blur-xl bg-slate-900/80 border-t border-slate-700/50 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAttachmentsOpen((prev) => !prev)}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            {attachmentsOpen && (
              <div className="absolute bottom-12 left-0 z-20 w-72 rounded-2xl border border-slate-700 bg-slate-900 shadow-xl p-3 space-y-3 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-100">Image analysis</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] ?? null);
                      setImageError(null);
                    }}
                    className="block w-full text-xs text-slate-200 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                  />
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Optional question about this image..."
                    rows={2}
                    className="w-full mt-1 rounded-md bg-slate-900/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 px-2 py-1 resize-none"
                  />
                  {imageError && (
                    <p className="text-red-400 whitespace-pre-wrap">{imageError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={imageLoading || !imageFile}
                    className="mt-1 inline-flex items-center justify-center px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {imageLoading ? 'Analyzing...' : 'Analyze image'}
                  </button>
                </div>
                <hr className="border-slate-700" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-100">Document analysis</p>
                  <input
                    type="file"
                    accept="application/pdf,text/plain"
                    onChange={(e) => {
                      setDocFile(e.target.files?.[0] ?? null);
                      setDocError(null);
                    }}
                    className="block w-full text-xs text-slate-200 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                  />
                  <textarea
                    value={docPrompt}
                    onChange={(e) => setDocPrompt(e.target.value)}
                    placeholder="What do you want to know from this document?"
                    rows={2}
                    className="w-full mt-1 rounded-md bg-slate-900/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 px-2 py-1 resize-none"
                  />
                  {docError && (
                    <p className="text-red-400 whitespace-pre-wrap">{docError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleAnalyzeDocument}
                    disabled={docLoading || !docFile}
                    className="mt-1 inline-flex items-center justify-center px-2 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {docLoading ? 'Analyzing...' : 'Analyze document'}
                  </button>
                </div>
              </div>
            )}
          </div>
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

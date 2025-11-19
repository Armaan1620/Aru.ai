import { useState } from 'react';
import { API_BASE_URL } from '../config';

interface UtilitiesPanelProps {
  token: string;
}

function UtilitiesPanel({ token }: UtilitiesPanelProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPrompt, setDocPrompt] = useState('');
  const [docResult, setDocResult] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const handleImageAnalyze = async () => {
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
      setImageResult(null);

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

      setImageResult(data.analysis);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze image';
      setImageError(message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDocAnalyze = async () => {
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
      setDocResult(null);

      const response = await fetch(
        `${API_BASE_URL}/api/utils/analyze-document`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = (await response.json()) as { analysis?: string; message?: string };

      if (!response.ok || !data.analysis) {
        throw new Error(data.message || 'Failed to analyze document');
      }

      setDocResult(data.analysis);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze document';
      setDocError(message);
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-2 border-b border-slate-800/60 bg-slate-900/70">
      <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-2">
        {/* Image analysis */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Image analysis</h2>
          <p className="text-xs text-slate-400">
            Upload an image and let Gemini describe it, extract details, or answer questions about it.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImageFile(e.target.files?.[0] ?? null);
              setImageResult(null);
              setImageError(null);
            }}
            className="block w-full text-xs text-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
          />
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Optional: Ask something specific about this image..."
            rows={2}
            className="w-full text-xs rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 px-3 py-2 resize-none"
          />
          <button
            type="button"
            onClick={handleImageAnalyze}
            disabled={imageLoading || !imageFile}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {imageLoading ? 'Analyzing...' : 'Analyze image'}
          </button>
          {imageError && (
            <p className="text-xs text-red-400 whitespace-pre-wrap">{imageError}</p>
          )}
          {imageResult && (
            <div className="mt-1 text-xs text-slate-100 whitespace-pre-wrap bg-slate-900/80 border border-slate-800 rounded-lg p-2 max-h-40 overflow-y-auto">
              {imageResult}
            </div>
          )}
        </div>

        {/* Document analysis */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Document analysis</h2>
          <p className="text-xs text-slate-400">
            Upload a PDF or plain text file and ask Gemini to summarize or extract insights.
          </p>
          <input
            type="file"
            accept="application/pdf,text/plain"
            onChange={(e) => {
              setDocFile(e.target.files?.[0] ?? null);
              setDocResult(null);
              setDocError(null);
            }}
            className="block w-full text-xs text-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
          />
          <textarea
            value={docPrompt}
            onChange={(e) => setDocPrompt(e.target.value)}
            placeholder="Optional: Ask for a summary, key points, or specific information..."
            rows={2}
            className="w-full text-xs rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 px-3 py-2 resize-none"
          />
          <button
            type="button"
            onClick={handleDocAnalyze}
            disabled={docLoading || !docFile}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {docLoading ? 'Analyzing...' : 'Analyze document'}
          </button>
          {docError && (
            <p className="text-xs text-red-400 whitespace-pre-wrap">{docError}</p>
          )}
          {docResult && (
            <div className="mt-1 text-xs text-slate-100 whitespace-pre-wrap bg-slate-900/80 border border-slate-800 rounded-lg p-2 max-h-40 overflow-y-auto">
              {docResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UtilitiesPanel;

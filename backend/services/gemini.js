let googleGenAiModulePromise;
let cachedClient;
let cachedClientKey;

const loadGoogleGenAiModule = async () => {
  if (!googleGenAiModulePromise) {
    googleGenAiModulePromise = import('@google/genai');
  }
  return googleGenAiModulePromise;
};

const getGeminiClient = async (apiKey) => {
  if (cachedClient && cachedClientKey === apiKey) {
    return cachedClient;
  }

  const { GoogleGenAI } = await loadGoogleGenAiModule();
  cachedClient = new GoogleGenAI({ apiKey });
  cachedClientKey = apiKey;
  return cachedClient;
};

async function generateGeminiResponse(message) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const { GoogleGenAI } = await import('@google/genai');

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: message,
  });

  const text = response.text || 'Sorry, I could not generate a response.';

  return text;
}

async function analyzeImageWithGemini({ buffer, mimeType, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const { GoogleGenAI } = await import('@google/genai');

  const ai = new GoogleGenAI({ apiKey });

  const base64Image = buffer.toString('base64');

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text:
            prompt ||
            'Describe this image in detail and highlight anything important.',
        },
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
  });

  const text = response.text || 'Sorry, I could not analyze this image.';

  return text;
}

async function analyzeDocumentWithGemini({
  buffer,
  mimeType,
  filename,
  prompt,
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const { GoogleGenAI } = await import('@google/genai');

  const ai = new GoogleGenAI({ apiKey });

  const base64Doc = buffer.toString('base64');

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text:
            prompt ||
            `You are a helpful assistant. Read the attached document (${filename}) and provide a clear summary and key insights.`,
        },
        {
          inlineData: {
            mimeType,
            data: base64Doc,
          },
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
  });

  const text = response.text || 'Sorry, I could not analyze this document.';

  return text;
}

module.exports = {
  generateGeminiResponse,
  analyzeImageWithGemini,
  analyzeDocumentWithGemini,
};

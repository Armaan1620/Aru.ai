#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { generateGeminiResponse } = require('../services/gemini');

const prompt = process.argv.slice(2).join(' ').trim() || 'Say hello to the Aru.ai team in one short sentence.';

(async () => {
  console.log('Gemini diagnostic prompt:', prompt);

  try {
    const response = await generateGeminiResponse(prompt);
    console.log('\nGemini response:\n');
    console.log(response);
  } catch (error) {
    console.error('\nGemini check failed:', error.message || error);
    console.error(
      'Verify GEMINI_API_KEY (and optional GEMINI_MODEL) are set in backend/.env before retrying.',
    );
    process.exitCode = 1;
  }
})();

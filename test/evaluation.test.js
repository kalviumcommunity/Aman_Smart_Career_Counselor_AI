const fs = require('fs');
const path = require('path');
const axios = require('axios');

describe('Career Counselor AI Evaluation', () => {
  const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.json'), 'utf8'));
  const judgePrompt = fs.readFileSync(path.join(__dirname, 'judgePrompt.txt'), 'utf8');

  dataset.forEach((sample, idx) => {
    test(`Sample ${idx + 1}: ${sample.input}`, async () => {
      // Call the model API
      const response = await axios.post('http://localhost:3000/api/gemini', { prompt: sample.input });
      const modelOutput = response.data.result;
      // Prepare judge input
      const judgeInput = {
        expected: sample.expected,
        actual: modelOutput
      };
      // Simulate judge evaluation (in real use, send to LLM)
      const pass = modelOutput.advice && modelOutput.reasoning &&
        modelOutput.advice === sample.expected.advice &&
        modelOutput.reasoning === sample.expected.reasoning;
      expect(pass).toBe(true);
    });
  });
});

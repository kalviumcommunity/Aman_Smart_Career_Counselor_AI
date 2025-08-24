const axios = require('axios');

describe('Top P Configuration Tests', () => {
  const baseURL = 'http://localhost:3000';
  
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Gemini API with Updated Top P', () => {
    test('should generate coherent career advice with Top P = 0.8', async () => {
      const testPrompts = [
        "I'm interested in software development but don't know where to start",
        "What career path should I choose with a background in mathematics?",
        "How can I transition from marketing to data science?"
      ];

      for (const prompt of testPrompts) {
        const response = await axios.post(`${baseURL}/api/gemini`, {
          prompt: prompt
        });

        expect(response.status).toBe(200);
        expect(response.data.result).toBeDefined();
        
        // Check response quality indicators
        const result = response.data.result;
        if (typeof result === 'object' && result.raw) {
          // Text response should be coherent and substantial
          expect(result.raw.length).toBeGreaterThan(50);
          expect(result.raw).toMatch(/career|job|skill|experience/i);
        } else if (result.advice) {
          // Structured response should contain advice
          expect(result.advice).toBeDefined();
          expect(result.advice.length).toBeGreaterThan(20);
        }

        console.log(`\nPrompt: ${prompt}`);
        console.log(`Response type: ${typeof result}`);
        console.log(`Response length: ${JSON.stringify(result).length} chars`);
      }
    });

    test('should maintain response consistency with Top P = 0.8', async () => {
      const prompt = "What skills are important for a data scientist?";
      const responses = [];
      
      // Generate multiple responses to test consistency
      for (let i = 0; i < 3; i++) {
        const response = await axios.post(`${baseURL}/api/gemini`, {
          prompt: prompt
        });
        
        expect(response.status).toBe(200);
        responses.push(response.data.result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // All responses should be valid
      responses.forEach((result, index) => {
        expect(result).toBeDefined();
        console.log(`\nResponse ${index + 1}:`, JSON.stringify(result).substring(0, 100) + '...');
      });

      // Responses should show some variation (due to Top P) but stay relevant
      const responseTexts = responses.map(r => 
        typeof r === 'object' ? (r.raw || r.advice || JSON.stringify(r)) : r.toString()
      );
      
      // Check that responses contain career-relevant terms
      responseTexts.forEach(text => {
        expect(text.toLowerCase()).toMatch(/data|scientist|skill|analysis|python|statistics|machine learning/i);
      });
    });

    test('should handle edge cases efficiently', async () => {
      const edgeCases = [
        "", // Empty prompt
        "a", // Very short prompt
        "What is the best career for someone who likes " + "x ".repeat(100), // Long prompt
        "🚀💼📊", // Emoji prompt
      ];

      for (const prompt of edgeCases) {
        const startTime = Date.now();
        
        try {
          const response = await axios.post(`${baseURL}/api/gemini`, {
            prompt: prompt
          });
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (response.status === 200) {
            expect(response.data.result).toBeDefined();
            console.log(`\nEdge case "${prompt.substring(0, 20)}...": ${responseTime}ms`);
          }
          
          // Should respond within reasonable time
          expect(responseTime).toBeLessThan(10000);
          
        } catch (error) {
          // Some edge cases may fail, but should fail gracefully
          expect(error.response?.status).toBeGreaterThanOrEqual(400);
          console.log(`\nEdge case "${prompt.substring(0, 20)}..." failed gracefully: ${error.response?.status}`);
        }
      }
    });
  });

  describe('Performance with Top P Configuration', () => {
    test('should maintain performance under load', async () => {
      const prompt = "Give me career advice for software engineering";
      const concurrentRequests = 10;
      
      const startTime = Date.now();
      
      const promises = Array(concurrentRequests).fill(0).map(() =>
        axios.post(`${baseURL}/api/gemini`, { prompt })
      );

      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulResponses = responses.filter(r => r.status === 'fulfilled');
      const failedResponses = responses.filter(r => r.status === 'rejected');

      console.log(`\nConcurrent requests performance:`);
      console.log(`Total time: ${totalTime}ms`);
      console.log(`Successful: ${successfulResponses.length}/${concurrentRequests}`);
      console.log(`Failed: ${failedResponses.length}/${concurrentRequests}`);
      console.log(`Average time per request: ${(totalTime / concurrentRequests).toFixed(2)}ms`);

      // At least 80% should succeed
      expect(successfulResponses.length).toBeGreaterThanOrEqual(concurrentRequests * 0.8);
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(30000); // 30 seconds max
    });

    test('should respect maxOutputTokens limit', async () => {
      const longPrompt = "Please provide a very detailed, comprehensive guide about " +
        "all possible career paths in technology, including requirements, " +
        "salaries, growth prospects, and detailed step-by-step instructions " +
        "for each career path. Cover software engineering, data science, " +
        "cybersecurity, AI/ML, DevOps, product management, and more.";

      const response = await axios.post(`${baseURL}/api/gemini`, {
        prompt: longPrompt
      });

      expect(response.status).toBe(200);
      
      const result = response.data.result;
      const responseText = typeof result === 'object' ? 
        (result.raw || result.advice || JSON.stringify(result)) : 
        result.toString();

      // Response should be substantial but not excessively long due to maxOutputTokens
      expect(responseText.length).toBeGreaterThan(100);
      expect(responseText.length).toBeLessThan(8000); // Reasonable upper bound
      
      console.log(`\nLong prompt response length: ${responseText.length} characters`);
    });
  });
});

const axios = require('axios');

describe('API Integration Tests for Dot Product Similarity', () => {
  const baseURL = 'http://localhost:3000';
  
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Vector Search API with Dot Product', () => {
    test('should insert and search vectors using dot product similarity', async () => {
      // Insert test vectors
      const testVectors = [
        { id: 'career1', embedding: [0.1, 0.2, 0.3, 0.4], metadata: { career: 'Software Engineer' } },
        { id: 'career2', embedding: [0.2, 0.3, 0.4, 0.5], metadata: { career: 'Data Scientist' } },
        { id: 'career3', embedding: [-0.1, -0.2, -0.3, -0.4], metadata: { career: 'Marketing Manager' } }
      ];

      // Insert vectors
      for (const vector of testVectors) {
        const response = await axios.post(`${baseURL}/api/vector/insert`, vector);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
      }

      // Search using dot product similarity
      const queryVector = [0.15, 0.25, 0.35, 0.45];
      const searchResponse = await axios.post(`${baseURL}/api/vector/search`, {
        embedding: queryVector,
        k: 3,
        method: 'dotproduct'
      });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data.method).toBe('dotproduct');
      expect(searchResponse.data.results).toHaveLength(3);
      expect(searchResponse.data.total).toBeGreaterThanOrEqual(3);

      // Results should be sorted by similarity (descending)
      const results = searchResponse.data.results;
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity);
      }

      // Most similar should be career2 (closest positive values)
      expect(results[0].id).toBe('career2');
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    test('should compare different similarity methods', async () => {
      const queryVector = [0.1, 0.2, 0.3, 0.4];
      
      // Test all three methods
      const methods = ['dotproduct', 'cosine', 'euclidean'];
      const results = {};

      for (const method of methods) {
        const response = await axios.post(`${baseURL}/api/vector/search`, {
          embedding: queryVector,
          k: 3,
          method: method
        });
        
        expect(response.status).toBe(200);
        expect(response.data.method).toBe(method);
        results[method] = response.data.results;
      }

      // All methods should return results
      expect(results.dotproduct).toHaveLength(3);
      expect(results.cosine).toHaveLength(3);
      expect(results.euclidean).toHaveLength(3);

      // Different methods may rank results differently
      console.log('\nSimilarity method comparison:');
      console.log('Dot Product:', results.dotproduct.map(r => ({ id: r.id, score: r.similarity })));
      console.log('Cosine:', results.cosine.map(r => ({ id: r.id, score: r.similarity })));
      console.log('Euclidean:', results.euclidean.map(r => ({ id: r.id, score: r.distance })));
    });

    test('should handle edge cases gracefully', async () => {
      // Test with zero vector
      const zeroVector = [0, 0, 0, 0];
      const response = await axios.post(`${baseURL}/api/vector/search`, {
        embedding: zeroVector,
        k: 2,
        method: 'dotproduct'
      });

      expect(response.status).toBe(200);
      expect(response.data.method).toBe('dotproduct');
      
      // All similarities should be 0 for zero vector
      response.data.results.forEach(result => {
        expect(result.similarity).toBe(0);
      });
    });

    test('should validate input parameters', async () => {
      // Test missing embedding
      try {
        await axios.post(`${baseURL}/api/vector/search`, {
          k: 5,
          method: 'dotproduct'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('embedding is required');
      }

      // Test invalid method (should default to euclidean)
      const response = await axios.post(`${baseURL}/api/vector/search`, {
        embedding: [0.1, 0.2, 0.3, 0.4],
        method: 'invalid_method'
      });

      expect(response.status).toBe(200);
      expect(response.data.method).toBe('invalid_method');
      expect(response.data.results[0]).toHaveProperty('distance'); // Should use euclidean as fallback
    });
  });

  describe('Performance under load', () => {
    test('should handle concurrent requests efficiently', async () => {
      const queryVector = [0.1, 0.2, 0.3, 0.4];
      const numRequests = 50;
      
      const startTime = Date.now();
      
      // Make concurrent requests
      const promises = Array(numRequests).fill(0).map(() =>
        axios.post(`${baseURL}/api/vector/search`, {
          embedding: queryVector,
          k: 5,
          method: 'dotproduct'
        })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`\nConcurrent requests test:`);
      console.log(`${numRequests} requests completed in ${totalTime}ms`);
      console.log(`Average response time: ${(totalTime / numRequests).toFixed(2)}ms`);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.method).toBe('dotproduct');
        expect(response.data.results.length).toBeGreaterThan(0);
      });

      // Should complete within reasonable time (10 seconds)
      expect(totalTime).toBeLessThan(10000);
    });
  });
});

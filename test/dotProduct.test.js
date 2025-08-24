const dotProduct = require('../dotProduct');
const cosineSimilarity = require('../cosineSimilarity');
const euclideanDistance = require('../euclideanDistance');

describe('Dot Product Similarity Tests', () => {
  
  // Basic functionality tests
  describe('Basic Functionality', () => {
    test('should calculate dot product correctly for simple vectors', () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      const result = dotProduct(a, b);
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    test('should handle zero vectors', () => {
      const a = [0, 0, 0];
      const b = [1, 2, 3];
      const result = dotProduct(a, b);
      expect(result).toBe(0);
    });

    test('should handle negative values', () => {
      const a = [-1, 2, -3];
      const b = [4, -5, 6];
      const result = dotProduct(a, b);
      expect(result).toBe(-32); // -1*4 + 2*-5 + -3*6 = -4 + -10 + -18 = -32
    });

    test('should throw error for vectors of different lengths', () => {
      const a = [1, 2, 3];
      const b = [4, 5];
      expect(() => dotProduct(a, b)).toThrow('Vectors must be the same length');
    });
  });

  // Performance and scalability tests
  describe('Performance and Scalability', () => {
    test('should handle large vectors efficiently', () => {
      const size = 10000;
      const a = Array(size).fill(0).map(() => Math.random());
      const b = Array(size).fill(0).map(() => Math.random());
      
      const startTime = performance.now();
      const result = dotProduct(a, b);
      const endTime = performance.now();
      
      expect(typeof result).toBe('number');
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should scale linearly with vector size', () => {
      const sizes = [1000, 2000, 4000];
      const times = [];
      
      sizes.forEach(size => {
        const a = Array(size).fill(0).map(() => Math.random());
        const b = Array(size).fill(0).map(() => Math.random());
        
        const startTime = performance.now();
        dotProduct(a, b);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      });
      
      // Check that time roughly doubles when size doubles
      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[1];
      
      // Allow some variance but should be roughly linear
      expect(ratio1).toBeGreaterThan(0.5);
      expect(ratio1).toBeLessThan(4);
      expect(ratio2).toBeGreaterThan(0.5);
      expect(ratio2).toBeLessThan(4);
    });
  });

  // Comparison with other similarity measures
  describe('Comparison with Other Similarity Measures', () => {
    test('should produce different results than cosine similarity', () => {
      const a = [1, 2, 3];
      const b = [2, 4, 6]; // b = 2*a, so cosine similarity should be 1
      
      const dotResult = dotProduct(a, b);
      const cosineResult = cosineSimilarity(a, b);
      
      expect(dotResult).toBe(28); // 1*2 + 2*4 + 3*6 = 28
      expect(cosineResult).toBeCloseTo(1, 5); // Should be exactly 1
      expect(dotResult).not.toBe(cosineResult);
    });

    test('should handle normalized vectors similarly to cosine similarity', () => {
      // For unit vectors, dot product equals cosine similarity
      const a = [0.6, 0.8]; // Unit vector
      const b = [0.8, 0.6]; // Unit vector
      
      const dotResult = dotProduct(a, b);
      const cosineResult = cosineSimilarity(a, b);
      
      expect(Math.abs(dotResult - cosineResult)).toBeLessThan(0.0001);
    });
  });

  // Edge cases and robustness
  describe('Edge Cases and Robustness', () => {
    test('should handle empty vectors', () => {
      const a = [];
      const b = [];
      const result = dotProduct(a, b);
      expect(result).toBe(0);
    });

    test('should handle single element vectors', () => {
      const a = [5];
      const b = [3];
      const result = dotProduct(a, b);
      expect(result).toBe(15);
    });

    test('should handle floating point precision', () => {
      const a = [0.1, 0.2, 0.3];
      const b = [0.4, 0.5, 0.6];
      const result = dotProduct(a, b);
      const expected = 0.1 * 0.4 + 0.2 * 0.5 + 0.3 * 0.6;
      expect(result).toBeCloseTo(expected, 10);
    });

    test('should handle very large numbers', () => {
      const a = [1e10, 2e10];
      const b = [3e10, 4e10];
      const result = dotProduct(a, b);
      expect(result).toBe(11e20);
    });

    test('should handle very small numbers', () => {
      const a = [1e-10, 2e-10];
      const b = [3e-10, 4e-10];
      const result = dotProduct(a, b);
      expect(result).toBeCloseTo(11e-20, 25);
    });
  });

  // Real-world embedding scenarios
  describe('Real-world Embedding Scenarios', () => {
    test('should work with typical embedding dimensions', () => {
      // Simulate 768-dimensional embeddings (like BERT)
      const dim = 768;
      const a = Array(dim).fill(0).map(() => (Math.random() - 0.5) * 2);
      const b = Array(dim).fill(0).map(() => (Math.random() - 0.5) * 2);
      
      const result = dotProduct(a, b);
      expect(typeof result).toBe('number');
      expect(isFinite(result)).toBe(true);
    });

    test('should distinguish between similar and dissimilar vectors', () => {
      const base = [1, 2, 3, 4, 5];
      const similar = [1.1, 2.1, 3.1, 4.1, 5.1]; // Very similar
      const dissimilar = [-1, -2, -3, -4, -5]; // Opposite direction
      
      const similarScore = dotProduct(base, similar);
      const dissimilarScore = dotProduct(base, dissimilar);
      
      expect(similarScore).toBeGreaterThan(dissimilarScore);
      expect(similarScore).toBeGreaterThan(0);
      expect(dissimilarScore).toBeLessThan(0);
    });
  });
});

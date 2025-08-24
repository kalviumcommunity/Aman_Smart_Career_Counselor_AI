const dotProduct = require('../dotProduct');
const cosineSimilarity = require('../cosineSimilarity');
const euclideanDistance = require('../euclideanDistance');

describe('Performance Benchmarks', () => {
  
  describe('Similarity Function Performance Comparison', () => {
    const testSizes = [100, 500, 1000, 5000];
    
    testSizes.forEach(size => {
      test(`Performance comparison for ${size}-dimensional vectors`, () => {
        // Generate random vectors
        const a = Array(size).fill(0).map(() => Math.random() - 0.5);
        const b = Array(size).fill(0).map(() => Math.random() - 0.5);
        
        // Benchmark dot product
        const dotStart = performance.now();
        const dotResult = dotProduct(a, b);
        const dotEnd = performance.now();
        const dotTime = dotEnd - dotStart;
        
        // Benchmark cosine similarity
        const cosineStart = performance.now();
        const cosineResult = cosineSimilarity(a, b);
        const cosineEnd = performance.now();
        const cosineTime = cosineEnd - cosineStart;
        
        // Benchmark euclidean distance
        const euclideanStart = performance.now();
        const euclideanResult = euclideanDistance(a, b);
        const euclideanEnd = performance.now();
        const euclideanTime = euclideanEnd - euclideanStart;
        
        console.log(`\nPerformance for ${size}D vectors:`);
        console.log(`Dot Product: ${dotTime.toFixed(3)}ms`);
        console.log(`Cosine Similarity: ${cosineTime.toFixed(3)}ms`);
        console.log(`Euclidean Distance: ${euclideanTime.toFixed(3)}ms`);
        
        // All should complete reasonably fast
        expect(dotTime).toBeLessThan(50);
        expect(cosineTime).toBeLessThan(100);
        expect(euclideanTime).toBeLessThan(50);
        
        // Dot product should be fastest (no square roots or normalization)
        expect(dotTime).toBeLessThanOrEqual(cosineTime);
      });
    });
  });

  describe('Scalability Tests', () => {
    test('should handle batch similarity calculations efficiently', () => {
      const queryVector = Array(768).fill(0).map(() => Math.random() - 0.5);
      const numVectors = 1000;
      const vectorDatabase = Array(numVectors).fill(0).map(() => 
        Array(768).fill(0).map(() => Math.random() - 0.5)
      );
      
      const startTime = performance.now();
      
      const similarities = vectorDatabase.map(vector => ({
        similarity: dotProduct(queryVector, vector),
        vector
      }));
      
      // Sort by similarity (descending)
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log(`\nBatch calculation for ${numVectors} vectors: ${totalTime.toFixed(3)}ms`);
      console.log(`Average time per vector: ${(totalTime / numVectors).toFixed(6)}ms`);
      
      expect(totalTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(similarities.length).toBe(numVectors);
      expect(similarities[0].similarity).toBeGreaterThanOrEqual(similarities[numVectors - 1].similarity);
    });

    test('should maintain performance with repeated calculations', () => {
      const a = Array(1000).fill(0).map(() => Math.random());
      const b = Array(1000).fill(0).map(() => Math.random());
      const iterations = 1000;
      
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        dotProduct(a, b);
        const end = performance.now();
        times.push(end - start);
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      console.log(`\nRepeated calculations (${iterations} iterations):`);
      console.log(`Average: ${avgTime.toFixed(6)}ms`);
      console.log(`Min: ${minTime.toFixed(6)}ms`);
      console.log(`Max: ${maxTime.toFixed(6)}ms`);
      
      // Performance should be consistent
      expect(maxTime - minTime).toBeLessThan(avgTime * 10); // Max variance shouldn't be too high
      expect(avgTime).toBeLessThan(1); // Should average under 1ms
    });
  });

  describe('Memory Efficiency', () => {
    test('should not cause memory leaks with large vectors', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Process many large vectors
      for (let i = 0; i < 100; i++) {
        const a = Array(10000).fill(0).map(() => Math.random());
        const b = Array(10000).fill(0).map(() => Math.random());
        dotProduct(a, b);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`\nMemory usage:`);
      console.log(`Initial: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Final: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});

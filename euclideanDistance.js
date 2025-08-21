// Euclidean distance between two vectors
function euclideanDistance(a, b) {
  if (a.length !== b.length) throw new Error('Vectors must be the same length');
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

module.exports = euclideanDistance;

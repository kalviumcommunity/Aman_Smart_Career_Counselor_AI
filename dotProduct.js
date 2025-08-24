// Dot product similarity between two vectors
function dotProduct(a, b) {
  if (a.length !== b.length) throw new Error('Vectors must be the same length');
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

module.exports = dotProduct;

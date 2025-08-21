// Simple vector database using vectordb (npm install vectordb)
// Simple in-memory vector database for development
const vectors = [];

module.exports = {
	insert: async (id, embedding, metadata) => {
		vectors.push({ id, embedding, metadata });
	},
	getAll: async () => {
		return vectors;
	}
};

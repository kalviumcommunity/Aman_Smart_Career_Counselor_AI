// Simple vector database using vectordb (npm install vectordb)
const VectorDB = require('vectordb');
const path = require('path');

const dbPath = path.join(__dirname, 'vectors.db');
const db = new VectorDB(dbPath);

module.exports = db;   

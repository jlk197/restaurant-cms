const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware do parsowania JSON
app.use(express.json());

// Przykładowa trasa API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

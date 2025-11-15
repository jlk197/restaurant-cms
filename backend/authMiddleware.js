const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware do weryfikacji JWT tokena
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Brak tokena autoryzacyjnego' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Nieprawidłowy lub wygasły token' 
      });
    }

    // Dodaj dane użytkownika do request
    req.user = user;
    next();
  });
};

// Funkcja do generowania tokena
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname
  };

  // Token ważny przez 24 godziny
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = { authenticateToken, generateToken };


const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido.' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer') return res.status(401).json({ message: 'Token mal formatado.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sua sessão expirou. Faça login novamente.' });
      }
      return res.status(401).json({ message: 'Token inválido.' });
    }

    req.userId = decoded.id;
    return next();
  });
};

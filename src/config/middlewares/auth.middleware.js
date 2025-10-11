const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Pega o token do header da requisição (cabeçalho 'Authorization')
  const authHeader = req.headers.authorization;

  // 2. Verifica se o header de autorização foi enviado
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' }); // 401 Unauthorized
  }

  // 3. O token vem no formato "Bearer <token>", então separamos em duas partes
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  // Desestrutura o array para pegar o "scheme" e o "token"
  const [scheme, token] = parts;

  // 4. Verifica se o "scheme" é "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  // 5. Verifica a validade do token usando o segredo definido no .env
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Se houver erro na verificação (token expirado, inválido, etc)
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    // Se o token for válido, o `decoded` conterá o payload (ex: { id: '...', name: '...' })
    // Adicionamos o ID do usuário na requisição para ser usado nos controllers
    req.userId = decoded.id;

    // A requisição pode continuar para o seu destino (o controller)
    return next();
  });
};
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token ausente" }); // Exatamente o erro do vídeo!
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Guarda o ID do usuário para usar nos controllers
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
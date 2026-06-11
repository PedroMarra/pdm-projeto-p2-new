const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

module.exports = {
  async register(req, res) {
    const { name, email, password } = req.body;

    // Verifica se já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-mail já cadastrado" });

    // Criptografa a senha e cria
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    // Gera o token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // (O bloco antigo de categorias foi removido daqui pois o seed.js já faz esse trabalho!)

    return res.status(201).json({ user: { id: user.id, name, email }, token });
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "E-mail ou senha incorretos" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "E-mail ou senha incorretos" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ user: { id: user.id, name: user.name, email }, token });
  }
};
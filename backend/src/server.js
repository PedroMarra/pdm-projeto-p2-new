require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rota: Health-check
app.get('/', (req, res) => {
  res.json({ ok: true, name: "gestao-financeira-api" });
});

// Rotas
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/auth', authRoutes); // Rota pública
app.use('/categories', categoryRoutes); // Rotas protegidas
app.use('/transactions', transactionRoutes); // Rotas protegidas

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
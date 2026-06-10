const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

// Importando o seu guarda-costas! (Ajuste o caminho da pasta se estiver diferente)
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas exigidas pelo professor (agora com o pedágio de segurança ativado)
router.get('/', authMiddleware, TransactionController.list);
router.post('/', authMiddleware, TransactionController.create);
router.delete('/:id', authMiddleware, TransactionController.delete);

module.exports = router;
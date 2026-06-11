const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');


const authMiddleware = require('../middlewares/authMiddleware');


router.use(authMiddleware);

// Listar todas as categorias
router.get('/', CategoryController.list);

// Criar uma nova categoria
router.post('/', CategoryController.create); 

// Atualizar uma categoria existente (Exigência do Postman)
router.put('/:id', CategoryController.update);

// Excluir uma categoria com trava de segurança (Exigência do Postman)
router.delete('/:id', CategoryController.delete);

module.exports = router;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {

  // 1. Listar categorias (Agora com filtro de isolamento perfeito)
  async list(req, res) {
    // Pegamos o ID do usuário que fez o login pelo token
    // (Usa req.userId ou req.user.id dependendo de como está o seu middleware de autenticação)
    const userId = req.userId || req.user?.id; 

    try {
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { userId: null },        // Traz as categorias padrões do sistema (sem dono)
            { userId: userId }       // Traz APENAS as categorias criadas por este usuário logado
          ]
        }
      });
      return res.json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar categorias." });
    }
  },

  // 2. Criar uma nova categoria (Agora carimbando o ID do dono)
  async create(req, res) {
    const { name, displayName, icon, background, isIncome } = req.body;
    const userId = req.userId || req.user?.id; 

    try {
      const newCategory = await prisma.category.create({
        data: {
          name,
          displayName,
          icon,
          background,
          isIncome,
          userId: userId // <-- A MÁGICA AQUI: Carimbamos a categoria com o ID do usuário!
        }
      });
      return res.status(201).json(newCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar categoria." });
    }
  },

  // 3. Atualizar categoria (Mantida exigência do professor)
  async update(req, res) {
    const { id } = req.params;
    const { displayName } = req.body;

    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { displayName }
      });
      return res.json(updatedCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar categoria." });
    }
  },

  // 4. Excluir categoria (Agora com trava de segurança contra intrusos)
  async delete(req, res) {
    const { id } = req.params;
    const userId = req.userId || req.user?.id;

    try {
      const category = await prisma.category.findUnique({
        where: { id }
      });

      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada." });
      }

      // Trava de segurança para não apagar as fixas (as que têm nome reservado ou userId nulo)
      const defaultCategories = ['income', 'transport', 'food', 'health', 'wellness'];
      if (defaultCategories.includes(category.name) || category.userId === null) {
        return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
      }

      // NOVO: Trava de segurança hacker-proof (Impede que o Pedro apague a categoria do Luiz)
      if (category.userId !== userId) {
        return res.status(403).json({ error: "Você não tem permissão para apagar esta categoria." });
      }

      await prisma.category.delete({
        where: { id }
      });

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao excluir categoria." });
    }
  }
};
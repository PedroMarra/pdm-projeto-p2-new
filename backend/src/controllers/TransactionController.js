const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient();

// O "molde" do Zod exigido pelo professor para barrar dados errados
const transactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória."),
  value: z.number({ required_error: "O valor é obrigatório.", invalid_type_error: "O valor deve ser um número." }),
  date: z.string().datetime({ message: "Data inválida." }).or(z.string()), 
  categoryId: z.string().min(1, "O ID da categoria é obrigatório.")
});

module.exports = {
  // 1. Listar transações (AGORA COM O CADEADO DE USUÁRIO)
  async list(req, res) {
    try {
      // Descobre quem é o usuário logado
      const userId = req.userId || req.user?.id || (typeof req.user === 'string' ? req.user : null);

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado." });
      }

      // Busca APENAS as transações que pertencem a este userId
      const transactions = await prisma.transaction.findMany({
        where: { userId: userId }, // <-- O FILTRO QUE FALTAVA
        include: { category: true } 
      });
      
      return res.json(transactions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar transações." });
    }
  },

  // 2. Criar transação (Com validação Zod)
  async create(req, res) {
    try {
      const { description, value, date, categoryId } = transactionSchema.parse(req.body);

      const userId = req.userId || req.user?.id || (typeof req.user === 'string' ? req.user : null);

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado ou token em falta." });
      }

      const newTransaction = await prisma.transaction.create({
        data: {
          description,
          value,
          date: new Date(date),
          categoryId,
          userId
        },
        include: { category: true } 
      });

      return res.status(201).json(newTransaction);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  },

  // 3. Excluir transação (BLINDADO)
  async delete(req, res) {
    const { id } = req.params;
    try {
      const userId = req.userId || req.user?.id || (typeof req.user === 'string' ? req.user : null);

      // Antes de deletar, o Prisma agora verifica se o ID da transação bate COM o ID do usuário dono dela
      await prisma.transaction.delete({ 
        where: { 
          id: id,
          userId: userId // Impede que o Luiz delete uma transação pelo ID se ela for sua
        } 
      });
      
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao excluir transação." });
    }
  }
};
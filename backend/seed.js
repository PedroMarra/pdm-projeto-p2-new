const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Povoando o banco de dados com categorias seguras...');

  const defaultCategories = [
    { name: 'income', displayName: 'Receita', icon: 'cash', background: '#4CAF50', isIncome: true },
    { name: 'transport', displayName: 'Transporte', icon: 'car', background: '#2196F3', isIncome: false },
    { name: 'food', displayName: 'Alimentação', icon: 'restaurant', background: '#FF9800', isIncome: false },
    { name: 'health', displayName: 'Saúde', icon: 'medkit', background: '#F44336', isIncome: false },
    { name: 'wellness', displayName: 'Lazer', icon: 'happy', background: '#9C27B0', isIncome: false },
  ];

  for (const cat of defaultCategories) {
    // Procura se a categoria já existe no banco
    const existingCategory = await prisma.category.findFirst({ 
      where: { name: cat.name } 
    });

    if (!existingCategory) {
      // Se não existe, cria ela zerada e sem dono (userId: null)
      await prisma.category.create({ 
        data: { ...cat, userId: null } 
      });
      console.log(`✅ Categoria criada: ${cat.displayName}`);
    } else {
      // Se já existe, atualiza apenas para garantir que não tem dono
      await prisma.category.update({
        where: { id: existingCategory.id },
        data: { userId: null }
      });
      console.log(`🔄 Categoria verificada/restaurada: ${cat.displayName}`);
    }
  }

  console.log('🎉 Categorias padrão prontas para uso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
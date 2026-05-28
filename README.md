# Flux - Sistema de Gestão Financeira

Repositório do projeto final da disciplina de Programação para Dispositivos Móveis (6º Semestre, Ciência da Computação - Centro Universitário IESB).

O Flux é uma aplicação de controle financeiro desenvolvida com foco em usabilidade e performance. A arquitetura foi dividida entre um aplicativo móvel construído em React Native e uma API RESTful em Node.js, garantindo a separação de responsabilidades (SoC) e facilitando a manutenção do código.

## 🛠 Tecnologias e Arquitetura

### Mobile (Frontend)
- **React Native & Expo**: Desenvolvimento multiplataforma da interface.
- **Context API**: Gerenciamento de estado global.
- **React Navigation**: Roteamento e navegação entre fluxos de telas.
- **AsyncStorage**: Armazenamento em cache no dispositivo móvel.
- **React Native Chart Kit**: Renderização de dados e métricas financeiras.

### API (Backend) & Banco de Dados
- **Node.js & Express**: Roteamento e lógica de negócios.
- **SQLite3**: Banco de dados relacional embarcado. A escolha pelo SQLite se deu pela facilidade de configuração em ambientes de desenvolvimento e testes. Ele elimina a necessidade de instanciar containers ou servidores externos para a avaliação do projeto. O arquivo do banco (`.sqlite`) é gerado e populado automaticamente na raiz do backend durante a primeira execução.

## 📌 Requisitos e Funcionalidades
- Cadastro e autenticação de usuário local.
- Registro de transações (receitas e despesas) com categorização.
- Cálculo de saldo consolidado em tempo real.
- Visualização gráfica analítica da distribuição de gastos.
- Persistência de dados integrada e comunicação assíncrona com a API.

## 🧪 Testes de Integração (Postman)
A estrutura do projeto inclui uma *collection* pré-configurada para validar os endpoints da API de forma isolada, simulando o comportamento do frontend.

**Passos para execução dos testes:**
1. Abra o aplicativo [Postman](https://www.postman.com/) em sua máquina.
2. Clique em **Import** (no painel superior esquerdo) e selecione o arquivo da *collection* localizado no repositório.
3. Certifique-se de que o backend esteja em execução (passo a passo de inicialização abaixo).
4. A *collection* possui rotas apontando para o ambiente local. Recomenda-se seguir o fluxo lógico de testes:
   - **1. Usuários (POST):** Teste a criação de um novo usuário e validação de login.
   - **2. Criar Transação (POST):** Envie o payload JSON para cadastrar receitas e despesas.
   - **3. Listar Transações (GET):** Verifique se o banco de dados retorna a lista atualizada e o status HTTP `200 OK`.
   - **4. Deletar Transação (DELETE):** Passe um `id` válido na rota para testar a exclusão física do registro no banco.
5. Analise as respostas em formato JSON e os status HTTP (`201 Created`, `200 OK`, `400 Bad Request`) para confirmar o funcionamento da lógica de negócios e a persistência no SQLite.

---

## 🚀 Instruções de Execução (Ambiente de Avaliação)

Para reproduzir o projeto localmente, realize o clone do [repositório oficial](https://github.com/PedroMarra/pdm-projeto-p2-new.git) e execute os comandos abaixo. 

**Atenção:** O backend e o frontend precisam rodar simultaneamente. O script abaixo contém todos os comandos necessários agrupados.

```bash
# 1. Clonagem do repostório
  git clone https://github.com/PedroMarra/pdm-projeto-p2-new.git

cd gestao-financeira-pdm
code .
se não estiver, mude para a branch develop

# 2. Inicialização da API (Backend)
cd backend
npm install
node src/server.js

# =========================================================================
# PAUSA: Mantenha o terminal acima aberto (ele exibirá a conexão com o SQLite).
# Abra um NOVO terminal na raiz do projeto (gestao-financeira-pdm) e continue:
# =========================================================================

# 3. Inicialização do Aplicativo (Frontend)
cd frontend
npm install
npx expo start -c --tunnel

# Nota: Caso a inicialização com o túnel apresente instabilidade na rede,
# interrompa o processo (Ctrl + C) e execute apenas: npx expo start
# Escaneie o Qrcode gerado no terminal do frontend para abrir o projeto no Expo

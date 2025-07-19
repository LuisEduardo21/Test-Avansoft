Sistema de Gerenciamento de Loja de Brinquedos
Descrição
Este projeto é um sistema de gerenciamento para uma loja de brinquedos, composto por um backend Node.js com SQLite e um frontend React com Material-UI. Ele permite:

Autenticação de usuários.
Gerenciamento de clientes (adicionar, editar, excluir).
Registro de vendas.
Visualização de estatísticas (gráfico de vendas diárias e cartões de maior volume, maior média e cliente mais frequente).
Cálculo da letra ausente no nome dos clientes.
Normalização de dados de uma API com JSON desorganizado.

A interface é totalmente em português, e o código segue os princípios SOLID para modularidade e manutenibilidade.
Funcionalidades

Autenticação: Login com usuário e senha via POST /api/login.
Clientes: Adicionar (POST /api/clients), editar (PUT /api/clients/:id), excluir (DELETE /api/clients/:id), e listar com nome, e-mail, data de nascimento e letra ausente.
Vendas: Adicionar vendas (POST /api/sales) com cliente, data e valor.
Estatísticas:
Gráfico de vendas diárias (GET /api/stats/daily-sales).
Cartões de estatísticas (GET /api/stats/top-clients) para maior volume, maior média e cliente mais frequente.

Letra Ausente: Calcula a primeira letra do alfabeto ausente no nome do cliente.
Normalização de Dados: Trata JSON desorganizado da API /api/clients.

Estrutura do Projeto
Backend

Tecnologias: Node.js, Express, SQLite, JWT para autenticação.
Endpoints:
POST /api/register: Registra um novo usuário.
POST /api/login: Autentica e retorna um token JWT.
GET /api/clients: Lista clientes.
POST /api/clients: Adiciona um cliente.
PUT /api/clients/:id: Edita um cliente.
DELETE /api/clients/:id: Exclui um cliente.
POST /api/sales: Adiciona uma venda.
GET /api/stats/daily-sales: Retorna vendas diárias (formato: [{ "sale_date": "YYYY-MM-DD", "total": number }]).
GET /api/stats/top-clients: Retorna estatísticas de clientes (formato: { highestVolume: { name, total }, highestAverage: { name, avg }, mostFrequent: { name, days } }).

Frontend

Tecnologias: React, Material-UI, Axios, Chart.js.
Estrutura (seguindo SOLID):
src/App.jsx: Componente principal, gerencia estado e renderização condicional (login/home).
src/components/LoginForm.jsx: Formulário de login.
src/components/ClientForm.jsx: Formulário para adicionar clientes.
src/components/SaleForm.jsx: Formulário para adicionar vendas.
src/components/ClientTable.jsx: Tabela de clientes com ações.
src/components/SalesStatistics.jsx: Gráfico de vendas e cartões de estatísticas.
src/components/EditClientDialog.jsx: Diálogo para editar clientes.
src/services/api.js: Funções para chamadas à API.
src/utils/clientUtils.js: Normalização de dados e cálculo da letra ausente.

Pré-requisitos

Node.js (v16 ou superior)
npm
SQLite

Configuração

Clone o Repositório:
git clone <URL_DO_REPOSITORIO>
cd loja-de-brinquedos

Backend:

Navegue até a pasta do backend:cd backend
npm install

Crie o banco de dados SQLite:// server.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
db.serialize(() => {
db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)`);
db.run(`CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT, email TEXT, birthdate TEXT)`);
db.run(`CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, client_id INTEGER, sale_date TEXT, amount REAL)`);
});

Inicie o backend:npm start

Frontend:

Navegue até a pasta do frontend:cd frontend
npm install

Inicie o frontend:npm run dev

Acesse http://localhost:5173.

Como Usar

Registrar um Usuário:

Use Postman ou curl para registrar:curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d '{"username": "testuser", "password": "testpass"}'

Fazer Login:

Acesse http://localhost:5173, insira testuser e testpass nos campos "Usuário" e "Senha".
Após login, a home exibe o "Painel da Loja de Brinquedos".

Adicionar Clientes:

Em "Adicionar Cliente", insira:
Nome: "Ana Beatriz", E-mail: "ana.b@example.com", Data de Nascimento: "1992-05-01".
Nome: "Carlos Eduardo", E-mail: "cadu@example.com", Data de Nascimento: "1987-08-15".

Verifique a tabela "Clientes" com a coluna "Letra Ausente".

Adicionar Vendas:

Em "Adicionar Venda":
Selecione "Ana Beatriz", Data da Venda: "2024-01-01", Valor: "150".
Selecione "Ana Beatriz", Data da Venda: "2024-01-02", Valor: "50".
Selecione "Carlos Eduardo", Data da Venda: "2024-01-01", Valor: "100".

Verificar Estatísticas:

Gráfico de Vendas Diárias: Deve mostrar 250 em 01/01/2024 e 50 em 02/01/2024.
Cartões de Estatísticas:
Maior Volume: "Ana Beatriz: R$200.00".
Maior Média: "Ana Beatriz: R$100.00".
Mais Frequente: "Ana Beatriz: 2 dias".

Se os cartões mostrarem "N/A", verifique o endpoint /api/stats/top-clients.

Editar/Excluir Clientes:

Use os ícones de edição e exclusão na tabela "Clientes".

Solução de Problemas
Erro: Cannot read properties of undefined (reading 'map') em SalesStatistics.jsx

Causa: O endpoint /api/stats/daily-sales retornava dados inválidos (ex.: null) ou falhava, deixando dailySales como undefined.
Solução: O frontend foi corrigido para garantir que dailySales seja sempre um array:
Em api.js, fetchStatistics retorna dailySales: [] em caso de erro.
Em App.jsx, verificações garantem que dailySales seja um array antes de atualizar o estado.
Em SalesStatistics.jsx, o gráfico só é renderizado se dailySales for um array não vazio.

Verificação: Abra o console do navegador (F12) e cheque os logs:
Resposta de /api/stats/daily-sales (em api.js).
dailySales recebido em SalesStatistics (em SalesStatistics.jsx).

Backend: Certifique-se de que /api/stats/daily-sales retorna:[
{ "sale_date": "2024-01-01", "total": 250 },
{ "sale_date": "2024-01-02", "total": 50 }
]

Cartões de Estatísticas Exibindo "N/A"

Causa: O endpoint /api/stats/top-clients não retorna dados válidos.
Solução: O frontend trata nulos, mas o backend deve retornar:{
"highestVolume": { "name": "Ana Beatriz", "total": 200 },
"highestAverage": { "name": "Ana Beatriz", "avg": 100 },
"mostFrequent": { "name": "Carlos Eduardo", "days": 5 }
}

Verificação: Teste com Postman: GET /api/stats/top-clients com header Authorization: Bearer <token>.

Contribuição

Faça um fork do repositório.
Crie uma branch para sua feature: git checkout -b minha-feature.
Commit suas mudanças: git commit -m 'Adiciona minha feature'.
Envie para o repositório: git push origin minha-feature.
Abra um Pull Request.

Licença
MIT

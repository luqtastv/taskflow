# TaskFlow API

API REST para gerenciamento de tarefas, desenvolvida com Node.js, Express e PostgreSQL.

## Tecnologias

- Node.js
- Express
- PostgreSQL
- pg
- nanoid
- Vitest
- Supertest

## Funcionalidades

- Listar todas as tarefas
- Criar novas tarefas
- Buscar tarefas por ID
- Atualizar tarefas
- Atualizar o estado de uma tarefa
- Excluir tarefas
- Validar dados e impedir títulos duplicados

## Estados das tarefas

- `pending` — Pendente
- `in-progress` — Em andamento
- `completed` — Concluída

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/tasks` | Listar tarefas |
| POST | `/tasks` | Criar tarefa |
| GET | `/tasks/:id` | Buscar tarefa por ID |
| PUT | `/tasks/:id` | Atualizar tarefa |
| PATCH | `/tasks/:id` | Atualizar estado |
| DELETE | `/tasks/:id` | Excluir tarefa |

## Instalação

Instale as dependências:

```bash
npm install
```

Configure a conexão com o PostgreSQL no arquivo `.env` e certifique-se de que o banco de dados e a tabela necessários estejam criados.

## Executar o projeto

```bash
npm run dev
```

## Testes

Execute os testes automatizados com:

```bash
npm test
```

## Objetivo

Projeto desenvolvido para praticar conceitos de back-end, APIs REST, integração com banco de dados relacional e testes automatizados.

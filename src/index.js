const express = require("express");
const cors = require("cors");

const { v4: uuidv4, validate } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;

  const user = users.filter((u) => u.username === username);
  if (user.length > 0) {
    return response
      .status(400)
      .json({ error: "Já tem um usuário com esse username" });
  }
  next();
}

app.post("/users", checksExistsUserAccount, (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  if (!username) {
    return response.status(400).json({ error: "informe o username" });
  }

  const user = users.filter((u) => u.username === username)[0];

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  if (!username) {
    return response.status(400).json({ error: "informe o username" });
  }

  const dateNow = new Date();

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: dateNow,
  };

  const user = users.filter((u) => u.username === username)[0];
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = users.filter((u) => u.username === username)[0];

  let todo = user.todos.filter((t) => t.id === id)[0];
  if (!todo) {
    return response.status(404).json({ error: "id todo invalido" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  if(!validate(id)){
    return response.status(404).json({error:'page dot found'})
  }

  const user = users.filter((u) => u.username === username)[0];
  const todo = user.todos.filter((t) => t.id === id)[0];
  if(!todo) {
    return response.status(400).json({error:'não encontramos esse todo'})
  }

  todo.done = true

  return response.status(200).json(todo)

});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({ error: "informe o id" });
  }

  const user = users.filter((u) => u.username === username)[0];

  const todo = user.todos.filter((t) => t.id === id)[0];
  if(!todo) {
    return response.status(404).json({error:'não encontramos esse todo'})
  }

  const todos = user.todos.filter((t) => t.id !== id);
  user.todos = todos;

  return response.status(204).send();
});

module.exports = app;

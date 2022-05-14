const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((e) => e.username === username);
  if (!user) {
    return response.status(404).send({ error: "Username not exist!" });
  }
  request.user = user;
  return next();
}

app.get("/users", (request, response) => {
  response.send(users);
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  if (users.some((e) => e.username === username)) {
    return response.status(400).send({ error: "Username already exists!" });
  }
  const id = uuidv4();
  const user = {
    id,
    name,
    username,
    todos: [],
  };
  users.push(user);
  response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;
  const user = request.user;
  const todo = user.todos.find((e) => e.id === id);
  if (!todo) {
    response.status(404).send({ error: "ToDo not exist!" });
  }
  todo.title = title;
  todo.deadline = deadline;
  response.send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const user = request.user;
  const todo = user.todos.find((e) => e.id === id);
  if (!todo) {
    response.status(404).send({ error: "ToDo not exist!" });
  }
  todo.done = true;
  response.send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const user = request.user;
  const todos = user.todos;
  const todo = todos.find((e) => e.id === id);
  if (!todo) {
    response.status(404).send({ error: "ToDo not exist!" });
  }
  todos.splice(todo, 1);
  response.status(204).send(user);
});

module.exports = app;

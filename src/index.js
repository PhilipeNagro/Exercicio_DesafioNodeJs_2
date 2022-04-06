const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');
// const { use } = require('express/lib/application');
// const { default: regex } = require('uuid/dist/regex');

const app = express();
app.use(express.json());
app.use(cors());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const {username} = request.headers;

  const existUser = users.find(user=> user.username === username);

  if(!existUser){
    return response.status(404).json({error: `Username nao encontrado`});
  }

  request.user = existUser;

  next();

}

function checksCreateTodosUserAvailability(request, response, next) {
  // Complete aqui
 const {user} = request;

// const findUser = users.find(user=> user.)
  if(!user.pro && user.todos.length>=10){
    // return response.status(404).json({msg: `Usuario não é pro mas tem menos de 10 todos`})
    console.log("Usuario não é pro e tem mais de 10 todos, ERROR");
    return response.status(404).json({error: `Usuario não é pro e tem mais de 10 todos, ERROR`})
  }

    console.log("Usuario é pro, ou tem menos de 10 todos");
    next();

}

function checksTodoExists(request, response, next) {
  // Complete aqui
  const {username} = request.headers;
  const {id} = request.params;  //para pegar o ID do Todos

  const findUser = users.find(user=> user.username === username);
  if(!findUser){
    console.log("usuario nao encontrado, checksTodoExists");
    return response.status(404).json({error: `Usuario nao encontrado`});
  }

  const checkIdUser = findUser.todos.find(todo=>todo.id=== id);

  if(!checkIdUser){
    return response.status(404).json({error: `Id nao encontrado`});
  }

  // Validar se é um uuidv4  conferir com fael
  const validateId = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
  

  if(validateId.test(checkIdUser)){
    return response.status(404).json({error: `Error, ID invalido, não é um uuid`})
  }
  
  
  request.todos = checkIdUser;
  request.user = findUser;
  next();
}

function findUserById(request, response, next) {
  // Complete aqui
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});


//ROTA A MAIS
app.get('/users/:id', findUserById, (request, response) => {
  const { user } = request;

  return response.json(user);
});


///ROTA A MAIS
app.patch('/users/:id/pro', findUserById, (request, response) => {
  const { user } = request;

  if (user.pro) {
    return response.status(400).json({ error: 'Pro plan is already activated.' });
  }

  user.pro = true;

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksTodoExists, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user, todo } = request;

  const todoIndex = user.todos.indexOf(todo);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = {
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById
};
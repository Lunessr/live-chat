const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const package = require('./package.json');

require('dotenv').config();
console.log(`Node.js environment: ${process.env.NODE_ENV}`);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/users', (_, res) => {
  res.send(Object.values(users));
});

const users = {};
io.on('connection', (socket) => {
  console.log(`io connected on socket id ${socket.id}`);

  socket.on('user-connected', (user) => {
    users[socket.id] = { ...user, id: socket.id };
    socket.broadcast.emit('users-changed', Object.values(users));
  });

  socket.on('new-chat-message', (message) => {
    socket.to(message.recipientId).emit('new-chat-message', {
      text: message.text,
      senderId: socket.id,
    });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    socket.broadcast.emit('users-changed', Object.values(users));
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Express server running on port: ${process.env.PORT}`);
  console.log('App version:', package.version);
});

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import jsonServer from 'json-server';
import { createServer } from 'node:http';
import usersRouter from './routes/users.js';
import chatsRouter from './routes/chats.js';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.use('/db', jsonServer.router('db.json'));

app.use('/api/users', usersRouter);

app.use('/api/chats', chatsRouter);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174']
  }
});

io.on('connection', (socket) => {
  console.log('made socket connection');

  socket.on('new message', (data) => {
    console.log('data: ', data);
  })

  socket.on('disconnect', () => {
    console.log('disconnected');
    io.emit('user disconnected');
  })

  socket.on('create-something', (data) => {
    console.log('create something: ', data);
  })
})

server.listen(port, () => {
  console.log(`server listening to port ${port}`);
})
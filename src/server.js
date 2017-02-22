// attempt to use express, I guess it's working
const express = require('express');

const app = express();

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const path = require('path');

const server = require('http').createServer(app);

const socketio = require('socket.io');

const shape = {};

// not sure if this is supposed to be better than the way you showed us
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../client/index.html`));
});

server.listen(PORT);

const io = socketio(server);

io.on('connection', (socket) => {
  socket.join('room1');
  socket.on('addShape', (data) => {
    const coords = {
      lastUpdate: data.lastUpdate,
      x: data.x,
      y: data.y,
      width: 50,
      height: 50,
      color: 'red',
    };
    shape[data.user] = coords;
    io.sockets.in('room1').emit('fromServer', { user: data.user, coords: shape[data.user] });
  });
  socket.on('movementUpdate', (data) => {
    shape[data.user].x += data.xUpdate;
    shape[data.user].y += data.yUpdate;
    shape[data.user].lastUpdate = new Date().getTime();
    io.sockets.in('room1').emit('fromServer', { user: data.user, coords: shape[data.user] });
  });

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
});

console.log(`listening on port ${PORT}`);

var WebSocket = require('ws');

var wss = new WebSocket.Server({ rejectUnauthorized: false, clientTracking: false, noServer: true });

wss.on('connection', (socket, req) => {
  console.log('ps1');
  socket.on('message', message => socket.send(message));

  const interval = setInterval(
    () => {
      if ('send' in req.body) {
        if (req.session.send) {
          socket.send(`${req.session.msg}`)
          req.session.send = false;
        };
      };
    },
    1000
  )

  socket.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = wss;
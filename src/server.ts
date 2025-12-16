import http from 'node:http';

const server = http.createServer((req, res) => {
  console.log('running');

  return res.end();
});

server.listen(5000);

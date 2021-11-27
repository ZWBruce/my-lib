import { createServer } from 'http';
import a from '@my-lib/utils';

const port = process.env.PORT || 1218;

const server = createServer((req, res) => {
  console.log(123)
  res.end(JSON.stringify(a));
});

server.listen(port);
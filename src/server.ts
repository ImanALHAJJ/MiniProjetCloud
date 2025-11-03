import http from 'http';
import { requestHandler } from './index';

const PORT = 8000;
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}/api/v1/sysinfo`);
});

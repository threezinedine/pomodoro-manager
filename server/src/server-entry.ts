import 'dotenv/config';
import { createServer } from 'http';
import { PORT } from './config/index';
import { app } from './main';
import { createWsServer } from './ws';

const httpServer = createServer(app);

// Attach WebSocket server to the same HTTP server
createWsServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

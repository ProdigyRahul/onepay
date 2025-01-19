import 'dotenv/config';
import { env } from './config/env.config';
import app from './app';

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const server = app.listen(env.PORT, () => {
  console.log(`
🚀 Server ready at: http://localhost:${env.PORT}
⭐️ Environment: ${env.NODE_ENV}
  `);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

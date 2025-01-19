import { cleanEnv, str, port, url } from 'envalid';

const validateEnv = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: port({ default: 5000 }),
    DATABASE_URL: url(),
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '7d' }),
    CORS_ORIGIN: str({ default: '*' }),
    API_PREFIX: str({ default: '/api' }),
  });
};

export const env = validateEnv(); 
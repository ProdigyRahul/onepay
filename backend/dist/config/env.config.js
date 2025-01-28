"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const envalid_1 = require("envalid");
const validateEnv = () => {
    return (0, envalid_1.cleanEnv)(process.env, {
        NODE_ENV: (0, envalid_1.str)({ choices: ['development', 'production', 'test'] }),
        PORT: (0, envalid_1.port)({ default: 5000 }),
        DATABASE_URL: (0, envalid_1.url)(),
        JWT_SECRET: (0, envalid_1.str)(),
        JWT_EXPIRES_IN: (0, envalid_1.str)({ default: '7d' }),
        CORS_ORIGIN: (0, envalid_1.str)({ default: '*' }),
        API_PREFIX: (0, envalid_1.str)({ default: '/api' }),
    });
};
exports.env = validateEnv();
//# sourceMappingURL=env.config.js.map
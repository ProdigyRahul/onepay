"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinAttemptLimiter = exports.sensitiveOperationsLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const apiError_1 = require("../utils/apiError");
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
});
exports.sensitiveOperationsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many sensitive operations from this IP, please try again later',
});
exports.pinAttemptLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    handler: (_req, _res) => {
        throw new apiError_1.ApiError(429, 'Too many PIN attempts, please try again later');
    },
});
//# sourceMappingURL=rateLimit.js.map
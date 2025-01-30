"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccountNumber = exports.generateTransactionId = void 0;
const nanoid_1 = require("nanoid");
const generateAlphanumeric = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);
const generateNumeric = (0, nanoid_1.customAlphabet)('0123456789', 16);
const generateTransactionId = () => {
    return generateAlphanumeric();
};
exports.generateTransactionId = generateTransactionId;
const generateAccountNumber = () => {
    return generateNumeric();
};
exports.generateAccountNumber = generateAccountNumber;
//# sourceMappingURL=transactionUtils.js.map
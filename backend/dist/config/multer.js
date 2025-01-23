"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const apiError_1 = require("../utils/apiError");
const fileFilter = (_req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
    }
    else {
        callback(new apiError_1.ApiError(400, 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});
//# sourceMappingURL=multer.js.map
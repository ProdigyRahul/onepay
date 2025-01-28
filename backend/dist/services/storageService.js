"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const apiError_1 = require("../utils/apiError");
const STORAGE_API_URL = process.env.STORAGE_API_URL || 'http://23.94.74.248:3000';
const STORAGE_API_KEY = process.env.STORAGE_API_KEY || 'iamgay';
exports.storageService = {
    uploadFile: async (file) => {
        try {
            const formData = new form_data_1.default();
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
            const response = await axios_1.default.post(`${STORAGE_API_URL}/upload`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'x-api-key': STORAGE_API_KEY,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error uploading file to storage:', error);
            throw new apiError_1.ApiError(500, 'Failed to upload file to storage');
        }
    },
    getFileUrl: (filename) => {
        return `${STORAGE_API_URL}/files/${filename}`;
    },
};
//# sourceMappingURL=storageService.js.map
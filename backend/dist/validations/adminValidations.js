"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKycStatusValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.updateKycStatusValidation = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.KYCStatus),
    remarks: zod_1.z.string().min(1, 'Remarks are required for KYC verification'),
});
//# sourceMappingURL=adminValidations.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const rateLimit_1 = require("../middleware/rateLimit");
const walletValidations_1 = require("../validations/walletValidations");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use(rateLimit_1.generalLimiter);
router.post('/', rateLimit_1.sensitiveOperationsLimiter, (0, validate_1.validate)(walletValidations_1.createWalletValidation), walletController_1.walletController.createWallet);
router.get('/', walletController_1.walletController.getWallet);
router.get('/balance', walletController_1.walletController.getWalletBalance);
router.get('/stats', walletController_1.walletController.getWalletStats);
router.post('/transfer', rateLimit_1.sensitiveOperationsLimiter, rateLimit_1.pinAttemptLimiter, (0, validate_1.validate)(walletValidations_1.transferValidation), walletController_1.walletController.transfer);
exports.default = router;
//# sourceMappingURL=walletRoutes.js.map
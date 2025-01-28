"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const walletValidations_1 = require("../validations/walletValidations");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/', (0, validate_1.validate)(walletValidations_1.createWalletValidation), walletController_1.walletController.createWallet);
router.get('/:walletId', walletController_1.walletController.getWallet);
router.post('/:walletId/add', (0, validate_1.validate)(walletValidations_1.addMoneyValidation), walletController_1.walletController.addMoney);
router.post('/:walletId/transfer', (0, validate_1.validate)(walletValidations_1.transferValidation), walletController_1.walletController.transfer);
router.patch('/:walletId/limits', (0, validate_1.validate)(walletValidations_1.updateLimitsValidation), walletController_1.walletController.updateLimits);
exports.default = router;
//# sourceMappingURL=walletRoutes.js.map
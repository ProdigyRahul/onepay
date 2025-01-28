"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twilioService = void 0;
const twilio_1 = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error('Missing required Twilio configuration');
}
const client = new twilio_1.Twilio(accountSid, authToken);
exports.twilioService = {
    async sendVerificationToken(phoneNumber) {
        client.verify.v2
            .services(verifyServiceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' })
            .then(verification => {
            console.log('SMS sent successfully:', verification.sid);
        })
            .catch(error => {
            console.error('Error sending SMS:', error);
        });
    },
    async verifyToken(phoneNumber, code) {
        try {
            const verificationCheck = await client.verify.v2
                .services(verifyServiceSid)
                .verificationChecks
                .create({ to: phoneNumber, code });
            return verificationCheck.status === 'approved';
        }
        catch (error) {
            console.error('Twilio verifyToken error:', error);
            throw new Error('Failed to verify code');
        }
    }
};
//# sourceMappingURL=twilioService.js.map
// import { Request, Response } from 'express';
// import { twilioClient } from '../utils/twillo';
// import dotenv from 'dotenv'

// dotenv.config()
// export class VerifyController {
//   async sendVerificationCode(req: Request, res: Response) {
//     const { phoneNumber } = req.body;

//     try {
//       const verification = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//         .verifications
//         .create({ to: phoneNumber, channel: 'sms' });

//       return res.status(200).json({ message: 'Verification code sent.', verification });
//     } catch (error) {
//       return res.status(500).json({ message: 'Error sending verification code.', error });
//     }
//   }

//   async verifyCode(req: Request, res: Response) {
//     const { phoneNumber, code } = req.body;

//     try {
//       const verificationCheck = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//         .verificationChecks
//         .create({ to: phoneNumber, code });

//       if (verificationCheck.status === 'approved') {
//         return res.status(200).json({ message: 'Phone number verified.', verificationCheck });
//       } else {
//         return res.status(400).json({ message: 'Invalid verification code.', verificationCheck });
//       }
//     } catch (error) {
//       return res.status(500).json({ message: 'Error verifying code.', error });
//     }
//   }
// }

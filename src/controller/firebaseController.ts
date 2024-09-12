// // src/controllers/FirebaseController.ts
// import { NextFunction, Request, Response } from 'express';
// import FirebaseService from '../service/firebaseService'; 

// class FirebaseController {
//   private firebaseService: FirebaseService;

//   constructor() {
//     this.firebaseService = new FirebaseService();
//   }

//   // OTP gönderme işlemi
//   async sendOtp(req: Request, res: Response,next:NextFunction): Promise<void> {
//     const { phoneNumber, recaptchaToken } = req.body;

//     try {
//       const verificationId = await this.firebaseService.sendOtp(phoneNumber, recaptchaToken);
//       res.status(200).json({ message: 'OTP gönderildi', verificationId });
//     } catch (error) {
//         next(error)
//     }
//   }

//   // OTP doğrulama işlemi
//   async verifyOtp(req: Request, res: Response,next:NextFunction): Promise<void> {
//     const { verificationId, otpCode } = req.body;

//     try {
//       const user = await this.firebaseService.verifyOtp(verificationId, otpCode);
//       res.status(200).json({ message: 'OTP doğrulandı', user });
//     } catch (error) {
//         next(error)
//     }
//   }
// }

// export default FirebaseController;

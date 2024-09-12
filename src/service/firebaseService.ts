// import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
// import { initializeApp } from "firebase/app";
// import firebaseConfig from "../utils/firebase";


// class FirebaseService {
//     private auth;
  
//     constructor() {
//       initializeApp(firebaseConfig);
//       this.auth = getAuth();
//     }
  
//     // OTP gönderme işlemi
//     async sendOtp(phoneNumber: string, recaptchaToken: string): Promise<ConfirmationResult> {
//       try {
//         const recaptchaVerifier = new RecaptchaVerifier(recaptchaToken, 
//           {size: 'invisible'},this.auth);
  
//         // signInWithPhoneNumber kullanarak OTP gönderiyoruz ve ConfirmationResult döndürüyoruz
//         const confirmationResult: ConfirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, recaptchaVerifier);
//         return confirmationResult;
//       } catch (error) {
//         console.error("OTP gönderim hatası:", error);
//         throw new Error('OTP gönderilemedi');
//       }
//     }
  
//     // OTP doğrulama işlemi
//     async verifyOtp(confirmationResult: ConfirmationResult, otpCode: string): Promise<any> {
//       try {
//         // OTP kodunu kullanarak doğrulama
//         const result = await confirmationResult.confirm(otpCode);
//         return result.user;
//       } catch (error) {
//         console.error("OTP doğrulama hatası:", error);
//         throw new Error('OTP doğrulama başarısız');
//       }
//     }
//   }
  
//   export default FirebaseService;
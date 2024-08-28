import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import passport from 'passport';
import prisma from './db';
import bcrypt from 'bcryptjs';
import { PassportStatic } from 'passport';
import dotenv from 'dotenv';
dotenv.config();

  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Define the field that contains the username
        passwordField: 'password', // Define the field that contains the password
      },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { email ,isEmailVerified:true} });
          if (!user) return done(null, false, { message: 'Invalid credentials' });

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

          return done(null, user); 
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID as string,
        clientSecret: process.env.GOOGLE_SECRET as string,
        callbackURL: `${process.env.BACK_URL}/auth/google/callback`
      },
      async (accessToken, refreshToken, profile: Profile, done) => {
        try {
          // Önce Google ID ile mevcut bir kullanıcı olup olmadığını kontrol edin
          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
    
          if (!user) {
            // Eğer Google ID ile eşleşen bir kullanıcı yoksa, e-posta adresi ile mevcut kullanıcıyı kontrol edin
            const email = profile.emails?.[0].value ?? '';
            user = await prisma.user.findUnique({ where: { email: email } });
    
            if (user) {
              // Kullanıcı e-posta ile daha önce kayıt olmuşsa, Google ID'sini güncelleyin ve kullanıcıyı aktif hale getirin
              user = await prisma.user.update({
                where: { email: email },
                data: {
                  googleId: profile.id,
                  isEmailVerified: true,
                },
              });
            } else {
              // E-posta ile kayıtlı kullanıcı yoksa yeni bir kullanıcı oluşturun
              user = await prisma.user.create({
                data: {
                  googleId: profile.id,
                  email: email,
                  password: '', // Google ile girişlerde parola boş bırakılır
                  firstName: profile.name?.givenName || "",
                  lastName: profile.name?.familyName || "",
                  isEmailVerified: true
                },
              });
            }
          } else if (!user.isEmailVerified) {
            // Eğer kullanıcı Google ID ile kayıtlı ama henüz aktif değilse, onu aktif hale getirin
            user = await prisma.user.update({
              where: { googleId: profile.id },
              data: { isEmailVerified: true },
            });
          }
    
          return done(null, user);
        } catch (err) {
          console.log(err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id:string, done) => {
    try {
      const user = await prisma.user.findUnique({where:{id}})
      if (user) {
        done(null, user);
      } else {
      
        done(new Error('User not found'));
      } 
    } catch (error) {
      done(error);
    }
  })

  export default passport
import { NextFunction, Request, Response } from 'express';
import prisma from '../config/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail } from '../config/nodmailer';
import jwt from 'jsonwebtoken'

export const resetPasswordRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetPasswordCode = crypto.randomInt(100000, 999999).toString();
        const resetPassCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        const hashedCode = await bcrypt.hash(resetPasswordCode, 10);

        await prisma.user.update({
            where: { email },
            data: {
                resetPassswordCode: hashedCode,
                resetPassCodeExpiresAt,
            },
        });

        await sendResetPasswordEmail({
            to: user.email,
            subject: "Reset Password",
            text: `Şifrenizi sıfırlamak için bu kodu kullanın: ${resetPasswordCode}. Bu kod 10 dakika boyunca geçerlidir.`
        });

        res.status(200).json({ message: 'Successfully sent reset password code' });
    } catch (error) {
        next(error);
    }
}

export const verifyResetCode = async (req: Request, res: Response, next: NextFunction) => {
    const { email, resetCode } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.resetPassswordCode) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }
        if (!user.resetPassCodeExpiresAt || user.resetPassCodeExpiresAt < new Date()) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        const isCodeValid = await bcrypt.compare(resetCode, user.resetPassswordCode);
        if (!isCodeValid) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '5m' });

        res.status(200).json({ message: 'Reset code verified successfully', resetToken });
    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword } = req.body;
    const {token} =req.params

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const user = await prisma.user.findUnique({ where: { email: decoded.email } });

        if (!user || !user.resetPassCodeExpiresAt || !user.resetPassswordCode) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: decoded.email },
            data: {
                password: hashedPassword,
                resetPassswordCode: null, 
                resetPassCodeExpiresAt: null,
            },
        });

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error:any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        next(error);
    }
}

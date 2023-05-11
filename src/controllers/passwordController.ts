import express, { Request, Response } from 'express'
import { ResetPassword } from '../models/passwordModel'
import { User } from '../models/userModel'
import {
    generatePasswordResetToken,
    validatePasswordResetToken,
    generateOtp,
    sendPasswordResetOTP,
} from '../utils/notifications'

export const genOtp = async (req: Request, res: Response) => {
    const { email } = req.body

    try {
        const user = await ResetPassword.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const { otp } = await generateOtp()
        const token = await generatePasswordResetToken(user, otp)
        await sendPasswordResetOTP(user.email, otp)

        return res.status(200).json({ message: 'OTP sent to your email' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    const { token } = req.params

    try {
        const user = await ResetPassword.findOne({ where: { token } })
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' })
        }

        const isValidToken = validatePasswordResetToken(user, token)
        if (!isValidToken) {
            return res.status(400).json({ message: 'Invalid or expired token' })
        }

        return res.status(200).json({ message: 'Token is valid' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params
    const { otp, email, newPassword, confirm_Password } = req.body

    try {
        const user = await ResetPassword.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const now = new Date()
        if (now > user.otp_expiry) {
            return res.status(400).json({ message: 'OTP has expired' })
        }

        if (otp !== user.otp) {
            return res.status(400).json({ message: 'Invalid OTP' })
        }

        await User.findByIdAndUpdate({ password: newPassword }, { where: { email } })

        return res
            .status(200)
            .json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

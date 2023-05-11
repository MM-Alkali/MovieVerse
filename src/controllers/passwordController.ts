import express, { Request, Response } from "express";
import { Password } from "../models/passwordModel";
import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
import {
  generatePasswordResetToken,
  validatePasswordResetToken,
  generateOtp,
  sendPasswordResetOTP,
} from "../utils/notifications";

export const genOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const password = await Password.findOne({ email });
    if (!password) {
      return res.render("Register", {
        message: "User not found, kindly register",
      });
    }

    if (password.otp && password.expiry > new Date()) {
      return res.render("VerifyOtp", { message: "OTP already sent" });
    }

    const { otp, expiry } = await generateOtp();
    const token = await generatePasswordResetToken(email, otp);
    await sendPasswordResetOTP(email, otp);

    await Password.updateOne(
      { email },
      { $set: { otp, expiry, token } },
      { upsert: true }
    );

    return res.render("VerifyOtp", { message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { id, token } = req.params;

  try {
    const { otp } = req.body;

    const password = await Password.findById(id);
    if (!password) {
      return res.render("VerifyOtp", { message: "Invalid or expired token" });
    }

    const isValidToken = validatePasswordResetToken(password, token);
    if (!isValidToken) {
      return res.render("VerifyOtp", { message: "Invalid or expired token" });
    }

    const now = new Date();
    if (now > password.expiry) {
      return res.render("VerifyOtp", { message: "OTP has expired" });
    }

    if (otp !== password.otp) {
      return res.render("VerifyOtp", { message: "Invalid OTP" });
    }

    return res.render("ResetPassword", { message: "Token is valid" });
  } catch (error) {
    console.error(error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { email, newPassword, confirm_Password } = req.body;

  try {
    const password = await Password.findOne({ email });
    if (!password) {
      return res.render("ResetPassword", {
        message: "Invalid or expired token",
      });
    }

    if (newPassword !== confirm_Password) {
      return res.render("ResetPassword", { message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    await Password.updateOne({
        token: null,
        otp: null,
        expiry: null,
      });

    return res.render("Login", { message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
  }
};

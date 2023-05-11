import nodemailer from 'nodemailer';
import { ResetPassword, ResetInfo, PasswordReset } from "../models/passwordModel";
import jwt from "jsonwebtoken";
// import { createTransport } from 'nodemailer-sendinblue-transport';

export const generateOtp = () => {
    const otp = Math.floor(4321 + Math.random() * 3000);
    const expiry = new Date();

    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

    return {otp, expiry};
};

export const generatePasswordResetToken = async (
  user: ResetInfo,
  otp: number
) => {
  const payload = {
    id: user.id,
    email: user.email,
    otp,
  };

  try {
    const token = jwt.sign(
      payload,
      process.env.PASSWORD_RESET_SECRET as string,
      { expiresIn: "30min" }
    );
    return token;
  } catch (error) {
    console.error(error);
    throw new Error("Error generating password reset token");
  }
};

export const sendPasswordResetOTP = async (email: string, otp: number) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <p>Your OTP to reset your password is:</p>
        <h1>${otp}</h1>
        <p>Please enter this OTP to reset your password.</p>
        <p>Note that the OTP is only valid for 30 minutes.</p>
        <p>If you did not make this request, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error("Error sending password reset OTP");
  }
};

/*================Using SendInBlue==================*/
// const transporter = nodemailer.createTransport(
//   createTransport({
//     apiKey: 'api_Key',
//   })
// );

// export const sendPasswordResetOTP = async (email: string, otp: number) => {
//   try {
//     const mailOptions = {
//       from: eaidcustomerservice@gmail.com,
//       to: email,
//       subject: 'Password Reset OTP',
//       html: `
//         <p>Your OTP to reset your password is:</p>
//         <h1>${otp}</h1>
//         <p>Please enter this OTP to reset your password.</p>
//         <p>Note that the OTP is only valid for 30 minutes.</p>
//         <p>If you did not make this request, please ignore this email.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error(error);
//     throw new Error('Error sending password reset OTP');
//   }
// };

export const validatePasswordResetToken = async (user: ResetInfo, token: string) => {
  try {
    const decodedToken: any = jwt.verify(
      token,
      process.env.PASSWORD_RESET_SECRET as string
    );
    if (decodedToken.id !== user.id || decodedToken.email !== user.email) {
      return false;
    }
    const expiry = new Date(decodedToken.expiry);
    if (expiry.getTime() < new Date().getTime()) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

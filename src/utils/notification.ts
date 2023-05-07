import nodemailer from 'nodemailer';

export const genOtp = () => {
    const otp = Math.floor(1234 + Math.random() * 5000);
    const expiry = new Date();

    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

    return {otp, expiry};
};

export const generatePasswordResetCode = (): string => {
    const length = 6;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      code += charset[randomIndex];
    }
  
    return code;
  };
  
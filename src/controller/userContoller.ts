import { Request, Response } from "express";
import { User } from "../model/userModel";
import { registerUserSchema, loginUserSchema, variables } from "../utils/utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResetPassword } from "../model/passwordReset";
import nodemailer from "nodemailer";
import { genOtp, generatePasswordResetCode } from "../utils/notification";

const jwtsecret = process.env.JWT_SECRET!;

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, fullname, username, password, confirm_password } = req.body;

    const validationResult = registerUserSchema.validate(req.body);

    if (validationResult.error) {
      return res.render("Register", {
        error: validationResult.error.details[0].message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("Register", { error: "Email already exists" });
    }

    const { otp, expiry } = genOtp();

    const newUser = await User.create({
      fullname,
      username,
      email,
      password: hashedPassword,
      otp,
      otp_expiry: expiry,
    });

    const user = await User.findOne({ email });

    if (!user) {
      return res.render("Register", { error: "User not found" });
    }

    const { _id } = user;
    const signatureToken = jwt.sign({ id: _id }, jwtsecret, {
      expiresIn: "30mins",
    });

    res.cookie("token", signatureToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    return res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validationResult = loginUserSchema.validate(req.body, variables);

    if (validationResult.error) {
      return res.render("Login", {
        error: validationResult.error.details[0].message,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.render("Login", {
        error: "Invalid email or password",
      });
    }

    const { id } = user;

    const signatureToken = jwt.sign({ id }, jwtsecret, { expiresIn: "30d" });

    res.cookie("token", signatureToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.redirect("/dashboard");
    } else {
      return res.render("Login", {
        error: "Invalid email or password",
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const Logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/");
};

export const requestPasswordReset = async (
  req: Request | any,
  res: Response
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordResetCode = generatePasswordResetCode();

    const passwordReset = await ResetPassword.findOneAndUpdate(
      { userId: user.id },
      { code: passwordResetCode },
      { upsert: true, new: true }
    );

    // Send the reset code to the user's email or phone number
    const resetLink = `https://your-app.com/reset-password?code=${passwordReset.code}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password reset code",
      text: `Your password reset code is: ${passwordReset.code}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
      return res.status(200).json({ message: "Reset code sent" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

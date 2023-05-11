import { Request, Response } from "express";
import { User } from "../models/userModel";
import {
  registerUserSchema,
  loginUserSchema,
  variables,
} from "../utils/utility";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOtp, generatePasswordResetToken, sendRegOTP } from "../utils/notifications";
import { Password } from "../models/passwordModel";

const jwtsecret = process.env.JWT_SECRET!;

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, fullname, phone, password, confirm_password } = req.body;

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

    const { otp, expiry } = generateOtp();

    const newUser = await User.create({
      fullname,
      phone,
      email,
      password: hashedPassword,
      otp,
      expiry: expiry,
      status: "pending",
    });

    await sendRegOTP(email, otp);

    return res.render('VerifyOtp');
  } catch (err) {
    console.log(err);
  }
};

export const Verify = async (req: Request | any, res: Response) => {
  try {
    const id = req.params.id;
    const { otp } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.render('Register', { message: "User not found, kindly register" });
    }

    if (user.otp !== otp) {
      return res.render('VerifyOtp', { message: "Invalid OTP" });
    }

    if (user.expiry < new Date()) {
      return res.render('VerifyOtp', { message: "OTP expired" });
    }

    user.status = "verified";
    user.otp = null;
    user.expiry = null;
    await user.save();

    const { _id, email } = user;

    await Password.create({
      userId: _id,
      email,
      token: null,
      otp: null,
      expiry: null,
    });

    const signatureToken = jwt.sign({ id: _id }, jwtsecret, {
      expiresIn: "30mins",
    });

    res.cookie("token", signatureToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    return res.render("Login");
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

    if (user.status !== "verified") {
      return res.render("Login", {
        error: "Your account has not been verified",
      });
    }

    if (user.status === "suspended") {
      return res.render("Login", {
        error: "Your account has been suspended",
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

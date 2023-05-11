import { Request, Response } from "express";
import { User } from "../models/userModel";
import {
  registerUserSchema,
  loginUserSchema,
  variables,
} from "../utils/utility";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { generateOtp } from "../utils/notifications";
import sendinblue from "nodemailer-sendinblue-transport";

const jwtsecret = process.env.JWT_SECRET!;

const transporter = nodemailer.createTransport(
  sendinblue({
    apiKey: process.env.sendinblue_api_key,
  })
);

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
      otp_expiry: expiry,
      status: "pending",
    });

    const transporter = nodemailer.createTransport({
      host: process.env.smtp_host,
      port: 587,
      auth: {
        user: process.env.sendinblue_user,
        pass: process.env.sendinblue_pass,
      },
    });

    const mailOptions = {
      from: "movieverse@co.uk",
      to: email,
      subject: "Account Verification",
      text: `Your OTP for account verification is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otp_expiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.status = "verified";
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    const { _id } = user;
    const signatureToken = jwt.sign({ id: _id }, jwtsecret, {
      expiresIn: "30mins",
    });

    res.cookie("token", signatureToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    return res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const Register = async (req: Request, res: Response) => {
//   try {
//     const { email, fullname, username, password, confirm_password } = req.body;

//     const validationResult = registerUserSchema.validate(req.body);

//     if (validationResult.error) {
//       return res.render("Register", {
//         error: validationResult.error.details[0].message,
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.render("Register", { error: "Email already exists" });
//     }

//     const { otp, expiry } = generateOtp();

//     const newUser = await User.create({
//       fullname,
//       username,
//       email,
//       password: hashedPassword,
//       otp,
//       otp_expiry: expiry,
//     });

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.render("Register", { error: "User not found" });
//     }

//     const { _id } = user;
//     const signatureToken = jwt.sign({ id: _id }, jwtsecret, {
//       expiresIn: "30mins",
//     });

//     res.cookie("token", signatureToken, {
//       httpOnly: true,
//       maxAge: 30 * 60 * 1000,
//     });

//     return res.redirect("/login");
//   } catch (err) {
//     console.log(err);
//   }
// };

// export const Login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     const validationResult = loginUserSchema.validate(req.body, variables);

//     if (validationResult.error) {
//       return res.render("Login", {
//         error: validationResult.error.details[0].message,
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.render("Login", {
//         error: "Invalid email or password",
//       });
//     }

//     const { id } = user;

//     const signatureToken = jwt.sign({ id }, jwtsecret, { expiresIn: "30d" });

//     res.cookie("token", signatureToken, {
//       httpOnly: true,
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//     });

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (isMatch) {
//       return res.redirect("/dashboard");
//     } else {
//       return res.render("Login", {
//         error: "Invalid email or password",
//       });
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

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
        error: "Your account has not been verified yet",
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

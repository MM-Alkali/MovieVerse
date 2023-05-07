import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel";

const jwtsecret = process.env.JWT_SECRET as string;

/*===================================EJS===================================*/
export const isUser = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.cookies.token;

    if (!authorization) {
      return res.redirect("/login");
    }

    const verifiedUser: any = jwt.verify(authorization, jwtsecret);

    if (!verifiedUser) {
      return res.redirect("/login");
    }

    const { id } = verifiedUser as { [key: string]: any };

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.redirect("/login");
    }

    req.user = verifiedUser;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

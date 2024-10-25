import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IUser } from "../database";
import IRegisterResponse from "../models/responses/IRegisterResponse";
import { IBaseResponse } from "../models/IBaseResponse";
import ILoginResponse from "../models/responses/ILoginReponse";
import ILoginRequest from "../models/requests/ILoginRequest";
import IForgetPasswordRequest from "../models/requests/IForgetPasswordRequest";
import IRegisterRequest from "../models/requests/IRegisterRequest";
import MailService from "../services/MailService";

const jwtSecret = config.JWT_SECRET as string;
const COOKIE_EXPIRATION_DAYS = 90; // cookie expiration in days
const expirationDate = new Date(
  Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
  expires: expirationDate,
  secure: false,
  httpOnly: true,
};

const register = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const request = req.body as IRegisterRequest;
    const userExists = await User.findOne({ email: request.email });
    if (userExists) {
      throw new ApiError(400, "User already exists!");
    }

    const user = await User.create({
      name: request.name,
      email: request.email,
      password: await encryptPassword(request.password),
    });

    const Response: IBaseResponse<IRegisterResponse> = {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "User registered successfully!",
      status: 200,
    };
    return res.json(Response);
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const createSendToken = async (user: IUser, res: Response) => {
  const { name, email, id } = user;
  const token = jwt.sign({ name, email, id }, jwtSecret, {
    expiresIn: "1d",
  });
  if (config.env === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  return token;
};

const login = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const request = req.body as ILoginRequest;
    const user = await User.findOne({ email: request.email }).select(
      "+password"
    );
    if (!user || !(await isPasswordMatch(request.password, user.password))) {
      throw new ApiError(400, "Incorrect email or password");
    }
    const token = await createSendToken(user!, res);
    const Response: IBaseResponse<ILoginResponse> = {
      data: {
        id: user.id,
        token,
      },
      message: "User logged in successfully!",
      status: 200,
    };

    return res.json(Response);
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const forgetPassword = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const request = req.body as IForgetPasswordRequest;
    const user = await User.findOne({ email: request.email });
    if (!user) {
      throw new ApiError(400, "Incorrect email");
    }
    const mailOptions = {
      from: "The Idea project",
      to: "majd.im76.im@gmail.com",
      subject: "My first Email!!!",
      text: "This is my first email. I am so excited!",
    };
    const msg = new MailService();
    msg.sendMessage(mailOptions);

    return res.json({ Response: true });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export { register, login, forgetPassword };

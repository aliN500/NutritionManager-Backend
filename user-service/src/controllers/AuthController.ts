import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IUser } from "../database";
import IRegisterResponse from "../models/responses/IRegisterResponse";
import { IBaseResponse } from "../models/IBaseResponse";
import ILoginResponse from "../models/responses/ILoginReponse";

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
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, "User already exists!");
    }

    const user = await User.create({
      name,
      email,
      password: await encryptPassword(password),
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
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await isPasswordMatch(password, user.password as string))) {
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

export default {
  register,
  login,
};

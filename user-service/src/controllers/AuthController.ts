import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../database";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IBaseResponse } from "../models/IBaseResponse";
import { Mailer } from "../services/MailService";
import UsersService from "../services/UsersService";
import { IForgetPasswordRequest, ILoginRequest, IRegisterRequest } from "../models/requests";
import { ILoginResponse, IRegisterResponse } from "../models/responses";

const jwtSecret = config.JWT_SECRET as string;
const createSendToken = async (user: IUser, res: Response) => {
  const { name, email, id } = user;
  const token = jwt.sign({ name, email, id }, jwtSecret, {
    expiresIn: "1d",
  });
  if (config.env === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  return token;
};

const COOKIE_EXPIRATION_DAYS = 90; // cookie expiration in days
const expirationDate = new Date(
  Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
  expires: expirationDate,
  secure: false,
  httpOnly: true,
};

const userService = new UsersService({ usersRepository: User, mailer: Mailer });

const register = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const request = req.body as IRegisterRequest;
    const userExists = await userService.findByEmail(request.email);
    if (userExists) {
      throw new ApiError(400, "User already exists!");
    }

    const user = await userService.createUser({
      active: false,
      deleted: false,
      name: request.name,
      email: request.email,
      password: await encryptPassword(request.password)
    });
    if (user) {
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
    } else {
      return {
        data: null,
        message: "Failed to register user!",
        status: 200,
      };
    }
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};



const login = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const request = req.body as ILoginRequest;
    const user = await userService.findByEmail(request.email, true)
    if (!user || !(await isPasswordMatch(request.password, user.password))) {
      throw new ApiError(400, "Incorrect email or password");
    }
    if (user.active) {
      throw new ApiError(400, "User is not active");
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
    const user = await userService.findByEmail(request.email);
    if (!user) {
      throw new ApiError(400, "Incorrect email");
    }
    const mailOptions = {
      from: "Nutrition manager",
      to: user.email,
      subject: "Reset password",
      text: "This is my first email. I am so excited!",
    };

    Mailer.sendMessage(mailOptions);

    return res.json({ Response: true });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export { register, login, forgetPassword };

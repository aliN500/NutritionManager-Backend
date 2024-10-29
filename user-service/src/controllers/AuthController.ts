import { Request, Response } from "express";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IBaseResponse } from "../models/IBaseResponse";
import { Mailer } from "../services/MailService";
import userService from "../services/UsersService";
import { IForgetPasswordRequest, ILoginRequest, IRegisterRequest, IResetPasswordRequest } from "../models/requests";
import { ILoginResponse, IRegisterResponse } from "../models/responses";


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
      verified: false,
      name: request.name,
      email: request.email,
      password: await encryptPassword(request.password),
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
    if (!user.active || !user.verified || user.deleted) {
      throw new ApiError(400, "User is not active");
    }
    const token = await userService.createSendToken({ email: user.email, id: user.id, name: user.name });

    const COOKIE_EXPIRATION_DAYS = 90; // cookie expiration in days
    const expirationDate = new Date(
      Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    );
    const cookieOptions = {
      expires: expirationDate,
      secure: false,
      httpOnly: true,
    };
    if (config.env === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
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

const verifyUser = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const token = req.query.token;
    const user = await userService.verifyUser(token);
    if (user && user.id) {
      return res.json({ Response: true });
    }
    return res.json({ Response: false });
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
    res = (res as Response);
    const request = req.body as IForgetPasswordRequest;
    const user = await userService.findByEmail(request.email);
    if (!user) {
      throw new ApiError(400, "Invalid email");
    }
    const token = await userService.createSendToken({ email: user.email, id: user.id, name: user.name });
    Mailer.sendResetPassword(user.email, `${config.BACK_END_LINK}/verify-reset-password?token=${token}`);
    const Response: IBaseResponse<boolean> = {
      data: true,
      message: "Forget password email sent successfully!",
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

const resetPassword = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = (res as Response);
    const request = req.body as IResetPasswordRequest;
    const user = await userService.findByEmail(request.email);
    if (!user) {
      throw new ApiError(400, "Invalid email");
    }
    const result = await userService.resetPassword(user.email, await encryptPassword(request.password));
    const Response: IBaseResponse<boolean> = {
      data: result,
      message: "Password was reset successfully!",
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

const verifyReset = async (req: any, res: any) => {
  try {
    req = req as Request;
    res = res as Response;
    const token = req.query.token;
    const user = await userService.verifyUser(token);
    if (user && user.id) {
      return res.redirect(`${config.FRONT_END_URL}/reset-password?email=${user.email}`);
    }
    return res.json({ Response: false });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export { verifyUser, register, login, forgetPassword, verifyReset, resetPassword };

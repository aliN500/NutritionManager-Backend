import { Router } from "express";
import { forgetPassword, login, register } from "../controllers/AuthController";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/forget-password", forgetPassword);

export default userRouter;

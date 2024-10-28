import { Router } from "express";
import { forgetPassword, login, register, verifyUser } from "../controllers/AuthController";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/verification", verifyUser);
userRouter.post("/forget-password", forgetPassword);

export default userRouter;

import { Router } from "express";
import { forgetPassword, login, register, verifyUser, verifyReset } from "../controllers/AuthController";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/verification", verifyUser);
userRouter.post("/forget-password", forgetPassword);
userRouter.get("/verify-reset-password", verifyReset);

export default userRouter;

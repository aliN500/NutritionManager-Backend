import { Router } from "express";
import { verifyToken } from "../middleware";
import { getUserProfile } from "../controllers/ProfileController";

const profileRouter = Router();

profileRouter.get("/:id", verifyToken, getUserProfile);

export default profileRouter;
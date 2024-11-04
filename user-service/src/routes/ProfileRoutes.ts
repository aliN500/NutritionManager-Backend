import { Router } from "express";
import { verifyToken } from "../middleware";
import { getUserProfile, updateUserProfile } from "../controllers/ProfileController";

const profileRouter = Router();

profileRouter.get("/:id", verifyToken, getUserProfile);
profileRouter.put("/:id", verifyToken, updateUserProfile);

export default profileRouter;
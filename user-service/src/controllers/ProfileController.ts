import { Request } from "express";
import userService from "../services/UsersService"

const getUserProfile = async (req: any, res: any) => {
    try {
        req = req as Request;
        res = res as Response;
        const id = req.params.id;
        const userProfile = await userService.getProfile(id)
        if (userProfile && userProfile.id) {
            return res.json({
                data: userProfile,
                message: "Invalid user data!",
                status: 400,
            })
        } else {
            return res.json({
                data: null,
                message: "Invalid user data!",
                status: 400,
            });
        }
    } catch (e) {
        return res.json({
            data: null,
            message: `Internal server error ${JSON.stringify(e)}`,
            status: 500,
        });
    }
}

export { getUserProfile }
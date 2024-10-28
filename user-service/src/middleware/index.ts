import { ErrorRequestHandler, NextFunction } from "express";
import { ApiError } from "../utils";
import jwt from "jsonwebtoken";
import { Response, Request } from "express";
import config from "../config/config";
export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode ||
            (error instanceof Error
                ? 400 // Bad Request
                : 500); // Internal Server Error
        const message =
            error.message ||
            (statusCode === 400 ? "Bad Request" : "Internal Server Error");
        error = new ApiError(statusCode, message, false, err.stack.toString());
    }
    next(error);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (process.env.NODE_ENV === "production" && !err.isOperational) {
        statusCode = 500; // Internal Server Error
        message = "Internal Server Error";
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    if (process.env.NODE_ENV === "development") {
        console.error(err);
    }

    res.status(statusCode).json(response);
    next();
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, config.JWT_SECRET as string, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            (req as any).user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};
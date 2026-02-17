import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, _, next) => {
  try {
    //get accessToken token
    //Authorization: Bearer <token>
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    //if not available then unauthorized request
    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    //decode it using jwt.verify
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //get user from decoded token
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );

    //asign req.user = user
    req.user = user;

    //next()
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export const verifyRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (userRole !== role) {
      throw new ApiError(403, "Access Denied");
    }
    next();
  };
};

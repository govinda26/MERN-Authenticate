import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.page) || 2;

  //page 1 - skip 0, page 1 - skip 2, page 2- skip 4
  const skip = (page - 1) * limit;

  //get total users
  const total = await User.countDocuments();

  //get users to display
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      totalUsers: total,
      //math.floor = 7/2 = 3.5 = 3    math.ceil = 7/2 = 3.5 = 4
      //this way we donot leave users
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }),
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  //delete user
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //return
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted Successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshToken",
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //return
  return res.status(200).json(new ApiResponse(200, user));
});

export { getUsers, deleteUser, getProfile };

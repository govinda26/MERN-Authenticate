import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const register = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { username, email, password } = req.body;

  //check if user has entered the details
  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  //check if user already exists or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or Username already exists");
  }

  //add user to db
  const user = await User.create({
    username: username,
    email: email,
    password: password,
  });

  if (!user) {
    throw new ApiError(500, "Error while registering User");
  }

  //creating loggedInUser to send json
  const createdUser = await User.findById(user._id).select("-password");

  //returning
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered Successfully",
      ),
    );
});

//generate Access and Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    //find user with userId
    const user = await User.findById(userId);
    //generate Access Token
    const accessToken = user.generateAccessToken();
    //generate Refresh Token
    const refreshToken = user.generateRefreshToken();

    //adding refreshToken inside db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    //returning created tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const login = asyncHandler(async (req, res) => {
  //get user details
  const { email, password } = req.body;

  //check if user has entered the details
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required fields");
  }

  //check if user with entered details exists in the db
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "User with entered credentials not found");
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(402, "Incorrect Password");
  }

  //calling token function
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  //creating logged in user to send in json
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  //creating options so that no one from frontend can modify the cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  };

  //return
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken: accessToken },
        "User logged in Successfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  //remove cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  //return
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User Logged out"));
});

const refreshToken = asyncHandler(async (req, res) => {
  //get refresh token from user
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  //if not available
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    //verify token received from user
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    if (!decodedToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    //get user from db through decoded token
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    //creating options for safety
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    //generating refreshToken
    const newRefreshToken = await generateAccessAndRefreshTokens(user._id);

    const { accessToken, refreshToken } = newRefreshToken;

    //returning response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "New Refresh Token Created",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { register, login, logout, refreshToken };

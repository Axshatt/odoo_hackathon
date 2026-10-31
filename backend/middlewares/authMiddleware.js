import jwt from "jsonwebtoken";
import { User } from "../Modals/User.js";
import { ApiError } from "../utils/Constructors/ApiError.js";
import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ENV } from "../config/env.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized access: Token missing");
  }

  try {
    const decodedToken = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decodedToken?.id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid access token: User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is disabled");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});


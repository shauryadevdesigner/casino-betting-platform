import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Not authorized", 401);
  }

  const token = header.split(" ")[1];
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

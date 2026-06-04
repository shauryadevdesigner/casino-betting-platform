import { AppError } from "./errorHandler.js";

export function requireAdmin(req, _res, next) {
  if (!req.user?.adminRole) {
    return next(new AppError("Admin access required", 403));
  }
  next();
}

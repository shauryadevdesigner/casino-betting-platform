export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(err.errors ? { errors: err.errors } : {}),
  });
}

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  code?: string;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err.stack);

  // Default error
  let statusCode = 500;
  let message = "Internal server error";

  // Handle specific error types
  if (
    err.message === "User not found" ||
    err.message === "Role not found" ||
    err.message === "Branch not found"
  ) {
    statusCode = 404;
    message = err.message;
  } else if (
    err.message.includes("already exists") ||
    err.message.includes("already in use")
  ) {
    statusCode = 409;
    message = err.message;
  } else if (
    err.message.includes("Invalid") ||
    err.message.includes("required")
  ) {
    statusCode = 400;
    message = err.message;
  } else if (err.message.includes("Cannot delete")) {
    statusCode = 400;
    message = err.message;
  } else if (err.code === "P2002") {
    // Prisma unique constraint violation
    statusCode = 409;
    message = "A record with this information already exists";
  } else if (err.code === "P2025") {
    // Prisma record not found
    statusCode = 404;
    message = "Record not found";
  } else if (process.env.NODE_ENV === "development") {
    // In development, show the actual error message
    message = err.message || "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err.message,
    }),
  });
};

export default errorHandler;

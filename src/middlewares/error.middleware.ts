import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  logging?: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    logging: boolean = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.logging = logging;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Alias para compatibilidade com código antigo
export class BadRequestError extends AppError {
  constructor({
    code,
    message,
    logging = false,
  }: {
    code: number;
    message: string;
    logging?: boolean;
  }) {
    super(message, code, logging);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Log do erro inesperado
  console.error("Erro inesperado:", err);

  return res.status(500).json({
    error: "Erro interno do servidor",
  });
};

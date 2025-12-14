import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodType } from "zod";
import { handleServiceResponse, ServiceResponse } from "@/common/utils/serviceResponse.js";

export const validateRequest = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errorMessage = `Invalid input: ${err.issues.map((e) => e.message).join(", ")}`;
      const statusCode = StatusCodes.BAD_REQUEST;
      const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
      return handleServiceResponse(serviceResponse, res);
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Unexpected error" });
  }
};
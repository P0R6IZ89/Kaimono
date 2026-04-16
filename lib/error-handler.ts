import { Prisma } from "@prisma/client";

export const getErrorMessage = (error: unknown): string => {
  //Prisma errors with a generic message
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    return "Something went wrong";
  }

  // Fallback for standard JavaScript errors
  if (error instanceof Error) {
    return error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  } else if (typeof error === "string") {
    return error;
  }

  // Default fallback message
  return "Something went wrong";
};

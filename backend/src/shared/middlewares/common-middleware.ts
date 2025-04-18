import { ZodError } from "zod";

export const validateData = (schema: any) => (req: any, res: any, next: any) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error: ZodError | any) {
    res.status(400).json({
      status: false,
      data: [],
      error: error?.issues,
    });
  }
};

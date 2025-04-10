import { Router } from "express";

import { BlogController } from "../../../controlller/front-end/blog/blog-controller";
import { validateData } from "../../../middlewares/common-middleware";
import { createBlogValidationSchema } from "../../../validators/blog/blog-validators";
import { ProtectedRouteMiddleware } from "../../../middlewares/auth/auth-middleware";

const blogRouter = Router();

blogRouter.get("/", BlogController.getBlogs);
blogRouter.post("/create-blog", ProtectedRouteMiddleware, validateData(createBlogValidationSchema), BlogController.createBlog)

export default blogRouter;

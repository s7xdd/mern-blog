import { NextFunction } from "express";

import { ResponseHandler } from "../../../../shared/components/response-handler/response-handler";
import { blogService } from "../../services/common/blog-service";

export const frontendBlogController = {
  async getBlogs(req: any, res: any, next: NextFunction) {
    try {
      const blogs = await blogService.findBlogs(req.query);

      return ResponseHandler.success({
        res,
        statusCode: 200,
        message: "Blogs fetched successfully",
        props: {
          total: blogs?.totalcount,
          limit: blogs?.limit,
          currentPage: Number(req.query.page || 1),
        },
        data: blogs?.data,
      });
    } catch (error) {
      next(error);
    }
  },
};

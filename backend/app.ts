import { connectDb } from "./src/config/db/db-connect";
import { app } from "./src/config/app/app-config";

import { errorHandler } from "./src/middlewares/error/error-middleware";
import frontEndRoutes from "./src/routes/front-end-routes";
import adminRoutes from "./src/routes/admin/admin-routes";

app.use("/api/v1", frontEndRoutes);
app.use("/admin/v1", adminRoutes);

app.use(errorHandler);

connectDb().then((res) => {
  console.log(res);
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));

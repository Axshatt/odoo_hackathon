import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

connectDB()
  .then(() => {
    app.listen(ENV.PORT, () => {
      console.log(`Server is running at http://localhost:${ENV.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });


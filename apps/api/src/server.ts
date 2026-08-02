import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users";
import courseRoutes from "./routes/courses";
import adminRoutes from "./routes/admin";
import internshipRoutes from "./routes/internships";
import trainingsRoutes from "./routes/trainings";
import publicRoutes from "./routes/public";
import careerRoutes from "./routes/careers";
import shopRoutes from "./routes/shop";
import blogsRoutes from "./routes/blogs";
import assessmentsRoutes from "./routes/assessments";
import inquiriesRoutes from "./routes/inquiries";
import salesRoutes from "./routes/sales";
import { initDb } from "./db";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/trainings", trainingsRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/assessments", assessmentsRoutes);
app.use("/api/inquiries", inquiriesRoutes);
app.use("/api/sales", salesRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  await initDb();
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
};

startServer().catch(console.error);

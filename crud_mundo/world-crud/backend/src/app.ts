import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { routes } from "./routes";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api", routes);
app.use(errorHandler);

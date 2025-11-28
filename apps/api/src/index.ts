import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./models";
import groomingAppointmentRoutes from "./routes/groomingAppointment.routes";
import dogRoutes from "./routes/dog.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// API Routes
app.use("/api/appointments", groomingAppointmentRoutes);
app.use("/api/dogs", dogRoutes);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});

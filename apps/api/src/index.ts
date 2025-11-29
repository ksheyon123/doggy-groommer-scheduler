import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./models";
import shopRoutes from "./routes/shop.routes";
import employeeRoutes from "./routes/employee.routes";
import dogRoutes from "./routes/dog.routes";
import groomingAppointmentRoutes from "./routes/groomingAppointment.routes";
import authRoutes from "./routes/auth.routes";
import invitationRoutes from "./routes/invitation.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dogs", dogRoutes);
app.use("/api/appointments", groomingAppointmentRoutes);
app.use("/api/invitations", invitationRoutes);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});

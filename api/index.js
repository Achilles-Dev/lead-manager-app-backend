import express from "express";
import cors from "cors";
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const EXPRESS_PORT = 3001;

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://lead-manager-app.vercel.app"
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/leads", async (req, res) => {
  const managers = await prisma.lead.findMany();
  res.json(managers);
});

app.post("/leads", async (req, res) => {
  const { name, email, status } = req.body;
  const leadManager = await prisma.lead.findUnique({
    where: {
      email: email,
    },
  });

  if (leadManager) {
    res.json("Email already exists");
  } else {
    const manager = await prisma.lead.create({
      data: {
        name,
        email,
        status,
      },
    });
    res.json(manager);
  }
});

// Handle local development vs Vercel deployment

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(EXPRESS_PORT, () => {
    console.log(
      `Server is running on http://localhost:${EXPRESS_PORT || 3001}`
    );
  });
}

// Export the app for Vercel
export default app;

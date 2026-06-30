import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", router);

// Health endpoint
app.get("/api", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Frontend build location
const frontendPath = path.resolve(
  process.cwd(),
  "../inventory/dist"
);

// Static files
app.use(express.static(frontendPath));

// SPA fallback ONLY for non-api routes
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(
    path.join(frontendPath, "index.html")
  );
});

export default app;

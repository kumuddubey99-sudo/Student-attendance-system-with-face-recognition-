import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const PYTHON_PORT = 8001;
let pythonProcess: ChildProcess | null = null;

// Function to start FastAPI Python server
function startPythonBackend() {
  console.log("[Server] Starting Python FastAPI backend on port", PYTHON_PORT);
  pythonProcess = spawn("python3", [
    "-m",
    "uvicorn",
    "backend.app.main:app",
    "--host",
    "127.0.0.1",
    "--port",
    String(PYTHON_PORT),
  ], {
    cwd: process.cwd(),
    stdio: ["ignore", "inherit", "inherit"],
  });

  pythonProcess.on("error", (err) => {
    console.error("[Server] Failed to spawn Python backend:", err);
  });

  pythonProcess.on("exit", (code, signal) => {
    console.log(`[Server] Python backend exited with code ${code} signal ${signal}`);
  });
}

// Helper to wait until FastAPI is ready
async function waitForPythonReady(maxAttempts = 20): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${PYTHON_PORT}/api/health`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
        req.on("error", reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });
      console.log("[Server] Python FastAPI backend is healthy and responding!");
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

// Clean shutdown
process.on("SIGINT", () => {
  if (pythonProcess) pythonProcess.kill("SIGTERM");
  process.exit(0);
});
process.on("SIGTERM", () => {
  if (pythonProcess) pythonProcess.kill("SIGTERM");
  process.exit(0);
});

async function start() {
  startPythonBackend();
  await waitForPythonReady();

  const app = express();

  // Reverse proxy all /api/* requests to FastAPI on PYTHON_PORT
  app.use("/api", (req: Request, res: Response) => {
    const targetPath = `/api${req.url}`;
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: PYTHON_PORT,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${PYTHON_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", (err) => {
      console.error("[Proxy Error]", err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: "Backend Service Unavailable",
          detail: "Could not connect to FastAPI server. Please wait a moment.",
        });
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  // Frontend Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Application listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[Server Fatal Error]", err);
  process.exit(1);
});

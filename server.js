const express = require("express");
const path = require("path");

const { initializeDatabase } = require("./backend/db");
const apiRouter = require("./backend/routes/api");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;

initializeDatabase();

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);
app.use(express.static(ROOT));

app.use((request, response, next) => {
  if (request.path.startsWith("/api/")) {
    next();
    return;
  }
  response.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`RecruitOS running at http://${HOST}:${PORT}`);
});

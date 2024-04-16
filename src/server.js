import express from "express";

const app = express();
const PORT = 5000;

app.get("/api/model", () => {});

app.listen(PORT, () => {
  console.log(`Modeling server started on 127.0.0.1:${PORT}`);
});

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Program } from "./module/Program.js";
import { JobCache } from "./module/JobCache.js";
import cors from "cors";
import path from "path";

const app = express();
const PORT = 5000;

const program = new Program();

app.use(express.static(path.resolve(process.cwd(), "public")));
app.use(express.json({ strict: false }));
app.use(cors({ origin: "*" }));

app.post("/model/sync", async (req, res) => {
  const payload = req.body;

  const response = await program.modelData(payload);

  return res.status(200).json(response);
});

app.post("/model/async", async (req, res) => {
  let { requestId, ...payload } = req.body;

  if (!requestId) {
    const _requestId = await JobCache.queue(program.modelData(payload));

    return res.status(200).json({ requestId: _requestId });
  }

  const job = JobCache.get(requestId);

  if (!job) {
    return res.status(404).send();
  }

  if (!job.isFulfilled()) {
    return res.status(200).json({ message: "Request pending" });
  }

  if (job.isRejected()) {
    return res.status(400).json({ message: "Request failed" });
  }

  return res.status(200).json(await job);
});

app.post("/model/direct", async (req, res) => {
  const payload = req.body;

  const result = await program._diagramsApiClient.render({ model: payload });

  res.status(200).json(result);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Modeling server started on 127.0.0.1:${PORT}`);
});

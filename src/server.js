import express from "express";
import { Program } from "./lib/Program";

const app = express();
const PORT = 5000;

const program = new Program();
const cache = new Map();

app.use(express.json({ strict: false }));

app.get("/model/sync", async (req, res) => {
  const payload = req.body;

  const response = await program.modelData(payload);

  return res.status(200).json(response);
});

const CreateJob = (promise) => {
  if (promise.isFulfilled) return promise;

  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  const result = promise.then(
    (value) => {
      isFulfilled = true;
      isPending = false;
      return value;
    },
    (error) => {
      isRejected = true;
      isPending = false;
      throw error;
    }
  );

  result.isFulfilled = () => isFulfilled;
  result.isPending = () => isPending;
  result.isRejected = () => isRejected;

  return result;
};

app.post("/model/async", async (req, res) => {
  let { requestId, ...payload } = req.body;

  if (!requestId) {
    requestId = crypto.randomUUID();

    const job = CreateJob(program.modelData(payload));
    cache.set(requestId, job);

    return res.status(200).json({ requestId });
  }

  if (!cache.has(requestId)) {
    return res.status(404).send();
  }

  const job = cache.get(requestId);

  if (!job.isFulfilled()) {
    return res.status(200).json({ message: "Request pending" });
  }

  if (job.isRejected()) {
    return res.status(200).json({ message: "Request failed" });
  }

  return res.status(200).json({ url: await job });
});

app.listen(PORT, () => {
  console.log(`Modeling server started on 127.0.0.1:${PORT}`);
});

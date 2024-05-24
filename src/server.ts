import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env into memory

import express from "express";
import { Program } from "./modules/Program.js";
import { JobStore } from "./modules/JobStore.js";
import cors from "cors";
import path from "path";
import { modelAsyncRequestSchema } from "./utils/Contract.js";
import { LoggerFactory } from "./modules/Logger.js";

const app = express(); // Initialize Express application
const program = new Program();
const jobStore = new JobStore();
const loggerFactory = new LoggerFactory("Server");

app.use(express.static(path.resolve(process.cwd(), "public")));
app.use(express.json({ strict: false }));
app.use(cors({ origin: "*" }));

app.post("/model/async", async (req, res) => {
	const serverLogger = loggerFactory.create("ModelAsync");
	const parseResult = modelAsyncRequestSchema.safeParse(req.body);

	if (!parseResult.success) {
		const errorMessage = parseResult.error.message;
		serverLogger.log(errorMessage);
		return res.status(400).json({ message: errorMessage });
	}

	const payload = parseResult.data;

	if (!("requestId" in payload)) {
		const promise = program.modelData(payload);
		const requestId = jobStore.queue(promise);

		return res.status(200).json({ requestId });
	}

	const requestId = payload.requestId;
	const job = jobStore.get(requestId);

	if (!job) {
		serverLogger.log(`Job "${requestId}" not found`);
		return res.status(404).send();
	}

	if (!job.isFulfilled()) {
		serverLogger.log(`Job "${requestId}" is pending`);
		return res.status(200).json({ message: "Request pending" });
	}

	if (job.isRejected()) {
		serverLogger.log(`Job "${requestId}" has failed`);
		return res.status(400).json({ message: "Request failed" });
	}

	serverLogger.log(`Job "${requestId}" has completed`);
	return res.status(200).json(await job.promise);
});

app.listen(process.env.PORT, () => {
	console.log(`Modeling server started on http://127.0.0.1:${process.env.PORT}`);
});

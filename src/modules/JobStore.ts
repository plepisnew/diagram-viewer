import crypto from "crypto";
import { ModelDataResponse } from "../utils/Contract";

export type Job = {
	promise: Promise<ModelDataResponse | null>;
	isPending: () => boolean;
	isFulfilled: () => boolean;
	isRejected: () => boolean;
};

export class JobStore {
	private static _cache = new Map<string, Job>();
	private static _gracePeriod = 5000;

	queue = (promise: Promise<ModelDataResponse | null>) => {
		const { job, requestId } = JobStore.instantiateJob(promise);
		JobStore._cache.set(requestId, job);

		return requestId;
	};

	get = (requestId: string) => {
		const job = JobStore._cache.get(requestId);

		return job;
	};

	private static instantiateJob = (
		promise: Promise<ModelDataResponse | null>
	): { job: Job; requestId: string } => {
		const requestId = crypto.randomUUID();

		let isPending = true;
		let isRejected = false;
		let isFulfilled = false;

		promise.then(
			(value) => {
				isFulfilled = true;
				isPending = false;

				setTimeout(() => {
					JobStore._cache.delete(requestId);
				}, JobStore._gracePeriod);
				return value;
			},
			(error) => {
				isRejected = true;
				isPending = false;

				setTimeout(() => {
					JobStore._cache.delete(requestId);
				}, JobStore._gracePeriod);
				throw error;
			}
		);

		const job: Job = {
			promise,
			isPending: () => isPending,
			isFulfilled: () => isFulfilled,
			isRejected: () => isRejected,
		};

		return { job, requestId };
	};
}

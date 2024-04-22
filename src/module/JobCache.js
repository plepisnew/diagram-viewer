import crypto from "crypto";

export class JobCache {
  static _cache = new Map();

  static _sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve), ms);
  static _gracePeriod = 5000;

  static queue = async (promise) => {
    const requestId = crypto.randomUUID();

    const job = JobCache._instantiateJob(promise, requestId);
    JobCache._cache.set(requestId, job);

    return requestId;
  };

  static get = (requestId) => {
    const job = JobCache._cache.get(requestId);

    return job;
  };

  static _instantiateJob = (promise, requestId) => {
    if (promise.isFulfilled) {
      return promise;
    }

    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;

    const result = promise.then(
      (value) => {
        isFulfilled = true;
        isPending = false;

        setTimeout(() => {
          JobCache._cache.delete(requestId);
        }, JobCache._gracePeriod);
        return value;
      },
      (error) => {
        isRejected = true;
        isPending = false;
        setTimeout(() => {
          JobCache._cache.delete(requestId);
        }, JobCache._gracePeriod);
        throw error;
      }
    );

    result.isFulfilled = () => isFulfilled;
    result.isPending = () => isPending;
    result.isRejected = () => isRejected;

    return result;
  };
}

import type { SetupTest } from "./utils";

export const now = () => Math.floor(Date.now() / 1000);

// SVM-based clock helper — returns the current SVM unix_timestamp
export const clockNow = (svm: SetupTest["svm"]) => Number(svm.getClock().unixTimestamp);

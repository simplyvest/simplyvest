import { describe, it, expect, vi, beforeEach } from "vitest";

import { createReconcilerService } from "../services/reconciler";

vi.mock("@solana-tdp/sdk", () => ({
  fetchAccountInfo: vi.fn(),
  decodeStreamAccount: vi.fn(),
  decodeMilestoneStreamAccount: vi.fn(),
}));

import {
  fetchAccountInfo,
  decodeStreamAccount,
  decodeMilestoneStreamAccount,
} from "@solana-tdp/sdk";

function createMockDb() {
  const selectLimit = vi.fn().mockResolvedValue([]);
  const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit });
  const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
  const select = vi.fn().mockReturnValue({ from: selectFrom });

  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
  const update = vi.fn().mockReturnValue({ set: updateSet });

  const insertValues = vi.fn();
  const insert = vi.fn().mockReturnValue({ values: insertValues });

  return {
    db: { select, update, insert } as any,
    mocks: { selectLimit, updateSet, updateWhere, insertValues },
  };
}

const baseStream = {
  id: "test-stream-id",
  type: "time" as const,
  status: "active" as const,
  creatorAddress: "Creator111111111111111111111111",
  recipientAddress: "Recip1111111111111111111111111",
  mintAddress: "Mint11111111111111111111111111",
  vaultAddress: "Vault1111111111111111111111111",
  amount: "1000000000",
  amountWithdrawn: "0",
  milestoneReached: false,
  creationTx: "3xYV1qz4...",
  createdAt: 1_700_000_000,
  lastSyncedAt: null,
  orgId: null,
  startTime: 1_700_000_000,
  endTime: 1_800_000_000,
  cliffTime: null,
  milestoneAuthority: null,
  tokenName: null,
  tokenSymbol: null,
  tokenDecimals: null,
  creatorDisplayName: null,
  description: null,
  closedAt: null,
  closeTx: null,
  syncVersion: 0,
};

describe("ReconcilerService.reconcile", () => {
  const rpcUrl = "https://api.devnet.solana.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns processed=0 when no active streams", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValue([]);

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(result).toEqual({ processed: 0, updated: 0, errors: [] });
  });

  it("processes a batch of active streams and returns correct counts", async () => {
    const { db, mocks } = createMockDb();
    const stream1 = { ...baseStream, id: "stream-1" };
    const stream2 = { ...baseStream, id: "stream-2" };
    mocks.selectLimit.mockResolvedValue([stream1, stream2]);

    vi.mocked(fetchAccountInfo)
      .mockResolvedValueOnce({ status: "exists", data: "dGVzdA==" })
      .mockResolvedValueOnce({ status: "not_found" });

    vi.mocked(decodeStreamAccount).mockReturnValue({
      amountWithdrawn: { toString: () => "500" },
    } as any);

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(result.processed).toBe(2);
    expect(result.updated).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it("marks stream completed and creates event when account is not found", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]).mockResolvedValueOnce([]);

    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "not_found" });

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(mocks.updateSet).toHaveBeenCalledWith({
      status: "completed",
      closedAt: expect.any(Number),
      lastSyncedAt: expect.any(Number),
    });
    expect(mocks.insertValues).toHaveBeenCalledWith({
      streamId: baseStream.id,
      eventType: "completed",
      actorAddress: baseStream.creatorAddress,
      txSignature: "reconciled",
      blockTime: expect.any(Number),
    });
    expect(result.updated).toBe(1);
  });

  it("skips event creation if a completed event already exists", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]).mockResolvedValueOnce([{ id: 1 }]);

    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "not_found" });

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(mocks.updateSet).toHaveBeenCalled();
    expect(mocks.insertValues).not.toHaveBeenCalled();
    expect(result.updated).toBe(1);
  });

  it("decodes existing account data and updates stream", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);

    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "exists", data: "dGVzdA==" });
    vi.mocked(decodeStreamAccount).mockReturnValue({
      amountWithdrawn: { toString: () => "250000000" },
    } as any);

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(decodeStreamAccount).toHaveBeenCalled();
    expect(mocks.updateSet).toHaveBeenCalledWith({
      lastSyncedAt: expect.any(Number),
      amountWithdrawn: "250000000",
    });
    expect(result.updated).toBe(1);
  });

  it("decodes milestone stream account and updates both fields", async () => {
    const milestoneStream = { ...baseStream, type: "milestone" as const };
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([milestoneStream]);

    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "exists", data: "bWlsZXN0b25l" });
    vi.mocked(decodeMilestoneStreamAccount).mockReturnValue({
      amountWithdrawn: { toString: () => "1000000000" },
      milestoneReached: true,
    } as any);

    const reconciler = createReconcilerService(db, rpcUrl);
    await reconciler.reconcile();

    expect(decodeMilestoneStreamAccount).toHaveBeenCalled();
    expect(decodeStreamAccount).not.toHaveBeenCalled();
    expect(mocks.updateSet).toHaveBeenCalledWith({
      lastSyncedAt: expect.any(Number),
      amountWithdrawn: "1000000000",
      milestoneReached: true,
    });
  });

  it("collects individual stream errors and continues processing", async () => {
    const { db, mocks } = createMockDb();
    const stream1 = { ...baseStream, id: "stream-1" };
    const stream2 = { ...baseStream, id: "stream-2" };
    mocks.selectLimit.mockResolvedValue([stream1, stream2]);

    vi.mocked(fetchAccountInfo)
      .mockResolvedValueOnce({ status: "error", error: "RPC timeout" })
      .mockResolvedValueOnce({ status: "exists", data: "dGVzdA==" });

    vi.mocked(decodeStreamAccount).mockReturnValue({
      amountWithdrawn: { toString: () => "100" },
    } as any);

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(result.processed).toBe(2);
    expect(result.updated).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("stream-1");
    expect(result.errors[0]).toContain("RPC timeout");
  });

  it("handles decode errors gracefully and still counts as processed", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);

    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "exists", data: "aW52YWxpZA==" });
    vi.mocked(decodeStreamAccount).mockImplementation(() => {
      throw new Error("corrupt data");
    });

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(mocks.updateSet).toHaveBeenCalledWith({ lastSyncedAt: expect.any(Number) });
    expect(result.processed).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  it("handles the top-level catch for unexpected errors", async () => {
    const db = {
      select: vi.fn().mockImplementation(() => {
        throw new Error("unexpected db error");
      }),
    } as any;

    const reconciler = createReconcilerService(db, rpcUrl);
    const result = await reconciler.reconcile();

    expect(result.processed).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("unexpected db error");
  });
});

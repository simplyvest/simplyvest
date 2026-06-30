import { describe, it, expect, vi, beforeEach } from "vitest";

import { createStreamService } from "../services/stream-service";

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

  const insertReturning = vi.fn().mockResolvedValue([{ id: "test" }]);
  const insertOnConflict = vi.fn().mockReturnValue({ returning: insertReturning });
  const insertValues = vi.fn().mockReturnValue({ onConflictDoNothing: insertOnConflict });
  const insert = vi.fn().mockReturnValue({ values: insertValues });

  return {
    db: { select, update, insert } as any,
    mocks: { selectLimit, selectWhere, selectFrom, updateWhere, updateSet },
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

describe("StreamService.syncStream", () => {
  const rpcUrl = "https://api.devnet.solana.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when stream is not found", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValue([]);

    const service = createStreamService(db);
    const result = await service.syncStream("nonexistent", rpcUrl);

    expect(result).toBeNull();
    expect(db.select).toHaveBeenCalledTimes(1);
    expect(db.update).not.toHaveBeenCalled();
  });

  it("skips sync if lastSyncedAt is within 60 seconds", async () => {
    const { db, mocks } = createMockDb();
    const now = Math.floor(Date.now() / 1000);
    const stream = { ...baseStream, lastSyncedAt: now - 30 };
    mocks.selectLimit.mockResolvedValue([stream]);

    const service = createStreamService(db);
    const result = await service.syncStream(stream.id, rpcUrl);

    expect(result).toBe(stream);
    expect(db.update).not.toHaveBeenCalled();
  });

  it("updates lastSyncedAt when no RPC URL is provided", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);
    const updated = { ...baseStream, lastSyncedAt: expect.any(Number) };
    mocks.selectLimit.mockResolvedValueOnce([updated]);

    const service = createStreamService(db);
    const result = await service.syncStream(baseStream.id);

    expect(mocks.updateSet).toHaveBeenCalledWith({ lastSyncedAt: expect.any(Number) });
    expect(mocks.updateWhere).toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  it("marks stream as completed when account is not found and status is active", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);
    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "not_found" });
    const completed = { ...baseStream, status: "completed" as const };
    mocks.selectLimit.mockResolvedValueOnce([completed]);

    const service = createStreamService(db);
    const result = await service.syncStream(baseStream.id, rpcUrl);

    expect(fetchAccountInfo).toHaveBeenCalledWith(rpcUrl, baseStream.id);
    expect(mocks.updateSet).toHaveBeenCalledWith({
      status: "completed",
      lastSyncedAt: expect.any(Number),
      closedAt: expect.any(Number),
    });
    expect(result).toEqual(completed);
  });

  it("decodes and updates amountWithdrawn for time-based streams", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);
    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "exists", data: "dGltZQ==" });
    vi.mocked(decodeStreamAccount).mockReturnValue({
      amountWithdrawn: { toString: () => "500000000" },
    } as any);
    const synced = { ...baseStream, amountWithdrawn: "500000000" };
    mocks.selectLimit.mockResolvedValueOnce([synced]);

    const service = createStreamService(db);
    const result = await service.syncStream(baseStream.id, rpcUrl);

    expect(fetchAccountInfo).toHaveBeenCalledWith(rpcUrl, baseStream.id);
    expect(decodeStreamAccount).toHaveBeenCalled();
    expect(decodeMilestoneStreamAccount).not.toHaveBeenCalled();
    expect(mocks.updateSet).toHaveBeenCalledWith({
      lastSyncedAt: expect.any(Number),
      amountWithdrawn: "500000000",
    });
    expect(result).toEqual(synced);
  });

  it("decodes and updates amountWithdrawn and milestoneReached for milestone streams", async () => {
    const milestoneStream = { ...baseStream, type: "milestone" as const };
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([milestoneStream]);
    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "exists", data: "bWlsZXN0b25l" });
    vi.mocked(decodeMilestoneStreamAccount).mockReturnValue({
      amountWithdrawn: { toString: () => "1000000000" },
      milestoneReached: true,
    } as any);
    const synced = { ...milestoneStream, amountWithdrawn: "1000000000", milestoneReached: true };
    mocks.selectLimit.mockResolvedValueOnce([synced]);

    const service = createStreamService(db);
    const result = await service.syncStream(milestoneStream.id, rpcUrl);

    expect(decodeMilestoneStreamAccount).toHaveBeenCalled();
    expect(decodeStreamAccount).not.toHaveBeenCalled();
    expect(mocks.updateSet).toHaveBeenCalledWith({
      lastSyncedAt: expect.any(Number),
      amountWithdrawn: "1000000000",
      milestoneReached: true,
    });
    expect(result).toEqual(synced);
  });

  it("falls back to updating only lastSyncedAt when decode fails", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);
    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "exists", data: "aW52YWxpZA==" });
    vi.mocked(decodeStreamAccount).mockImplementation(() => {
      throw new Error("decode failed");
    });
    const synced = { ...baseStream, lastSyncedAt: expect.any(Number) };
    mocks.selectLimit.mockResolvedValueOnce([synced]);

    const service = createStreamService(db);
    const result = await service.syncStream(baseStream.id, rpcUrl);

    expect(mocks.updateSet).toHaveBeenCalledWith({ lastSyncedAt: expect.any(Number) });
    expect(result).toEqual(synced);
  });

  it("falls back to updating only lastSyncedAt on RPC error", async () => {
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([baseStream]);
    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "error", error: "RPC timeout" });
    const synced = { ...baseStream, lastSyncedAt: expect.any(Number) };
    mocks.selectLimit.mockResolvedValueOnce([synced]);

    const service = createStreamService(db);
    const result = await service.syncStream(baseStream.id, rpcUrl);

    expect(mocks.updateSet).toHaveBeenCalledWith({ lastSyncedAt: expect.any(Number) });
    expect(result).toEqual(synced);
  });

  it("does not mark non-active streams as completed when account is gone", async () => {
    const cancelledStream = { ...baseStream, status: "cancelled" as const };
    const { db, mocks } = createMockDb();
    mocks.selectLimit.mockResolvedValueOnce([cancelledStream]);
    vi.mocked(fetchAccountInfo).mockResolvedValue({ status: "not_found" });
    const synced = { ...cancelledStream, lastSyncedAt: expect.any(Number) };
    mocks.selectLimit.mockResolvedValueOnce([synced]);

    const service = createStreamService(db);
    await service.syncStream(cancelledStream.id, rpcUrl);

    expect(mocks.updateSet).toHaveBeenCalledWith({ lastSyncedAt: expect.any(Number) });
    expect(mocks.updateSet).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed" }),
    );
  });
});

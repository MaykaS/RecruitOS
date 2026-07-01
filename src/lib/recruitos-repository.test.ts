import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSupabaseClient = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: mockGetSupabaseClient,
}));

describe("recruitos repository", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("loads local fallback data when Supabase is unavailable", async () => {
    mockGetSupabaseClient.mockReturnValue(null);

    const localStorage = {
      store: new Map<string, string>(),
      getItem(key: string) {
        return this.store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        this.store.set(key, value);
      },
      removeItem(key: string) {
        this.store.delete(key);
      },
      clear() {
        this.store.clear();
      },
    };

    vi.stubGlobal("window", { localStorage });

    const repository = await import("@/lib/recruitos-repository");
    const result = await repository.loadRecruitOSData();

    expect(result.mode).toBe("local");
    expect(result.message).toContain("local storage");
    expect(result.data.applications.length).toBeGreaterThan(0);

    vi.unstubAllGlobals();
  });

  it("persists to local fallback storage when Supabase is unavailable", async () => {
    mockGetSupabaseClient.mockReturnValue(null);

    const storage = new Map<string, string>();
    const localStorage = {
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      clear() {
        storage.clear();
      },
    };

    vi.stubGlobal("window", { localStorage });

    const repository = await import("@/lib/recruitos-repository");
    const { seedData, STORAGE_KEY } = await import("@/lib/recruitos");
    const previous = seedData();
    const next = {
      ...previous,
      actionItems: [
        ...previous.actionItems,
        {
          ...previous.actionItems[0],
          id: "action-test",
          title: "Persist me locally",
        },
      ],
    };

    const result = await repository.persistRecruitOSCollections(previous, next, ["actionItems"]);

    expect(result.mode).toBe("local");
    expect(storage.get(STORAGE_KEY)).toContain("Persist me locally");

    vi.unstubAllGlobals();
  });

  it("syncs changed Supabase collections by deleting removed rows and upserting remaining rows", async () => {
    const deleteIn = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn(() => ({ in: deleteIn }));
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({
      select: vi.fn(),
      upsert,
      delete: deleteFn,
    }));

    mockGetSupabaseClient.mockReturnValue({ from });

    const repository = await import("@/lib/recruitos-repository");
    const { seedData } = await import("@/lib/recruitos");
    const previous = seedData();
    const next = {
      ...previous,
      actionItems: previous.actionItems.slice(1),
    };

    const result = await repository.persistRecruitOSCollections(previous, next, ["actionItems"]);

    expect(result.mode).toBe("supabase");
    expect(from).toHaveBeenCalledWith("action_items");
    expect(deleteFn).toHaveBeenCalled();
    expect(deleteIn).toHaveBeenCalledWith("id", [previous.actionItems[0].id]);
    expect(upsert).toHaveBeenCalled();
  });
});

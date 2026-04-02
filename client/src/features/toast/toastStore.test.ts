import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToastStore } from "./stores/toastStore";

describe("useToastStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] });
  });

  it("starts with empty toasts array", () => {
    const { result } = renderHook(() => useToastStore());
    expect(result.current.toasts).toEqual([]);
  });

  it("add adds a toast with correct properties", () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.add("success", "Saved!");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      variant: "success",
      message: "Saved!",
      autoDismiss: 4000,
    });
  });

  it("add uses provided autoDismiss value", () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.add("error", "Oops", 6000);
    });

    expect(result.current.toasts[0].autoDismiss).toBe(6000);
  });

  it("add returns the toast id", () => {
    const { result } = renderHook(() => useToastStore());

    let id: string | undefined;
    act(() => {
      id = result.current.add("info", "Hello");
    });

    expect(id).toBeDefined();
    expect(id).toMatch(/^toast-\d+$/);
  });

  it("add appends toasts, newest at the end", () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.add("success", "First");
      result.current.add("error", "Second");
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].message).toBe("First");
    expect(result.current.toasts[1].message).toBe("Second");
  });

  it("remove removes the toast with given id", () => {
    const { result } = renderHook(() => useToastStore());

    let id: string;
    act(() => {
      id = result.current.add("warning", "Watch out");
    });

    act(() => {
      result.current.remove(id!);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("remove is idempotent — removing non-existent id does not throw", () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.add("info", "Test");
      result.current.remove("non-existent-id");
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it("clear removes all toasts", () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.add("success", "One");
      result.current.add("error", "Two");
      result.current.add("info", "Three");
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.toasts).toEqual([]);
  });
});

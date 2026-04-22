import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useHistory } from "../useHistory.ts";
import { FieldPath } from "../../FieldPath.ts";

const path = new FieldPath(["some", "field", "path"]);
const otherPath = new FieldPath(["other", "field", "path"]);
const makeChange = (prev: unknown, next: unknown, thePath = path) => ({
    path: thePath,
    prevValue: prev,
    newValue: next,
});

describe("useHistory", () => {
    const setup = (maxSize = 10) => {
        const setData = vi.fn();
        const hook = renderHook(() => useHistory({ maxSize, setData }));
        return { setData, hook };
    };

    it("starts with an empty stack and no undo/redo available", () => {
        const { hook } = setup();
        expect(hook.result.current.canUndo).toBe(false);
        expect(hook.result.current.canRedo).toBe(false);
    });

    describe("push", () => {
        it("enables undo after a push", () => {
            const { hook } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            expect(hook.result.current.canUndo).toBe(true);
        });

        it("does not enable redo after a plain push", () => {
            const { hook } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            expect(hook.result.current.canRedo).toBe(false);
        });

        it("discards future entries when pushing mid-stack", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.push(makeChange("b", "c", otherPath))); // different path to avoid conflation
            act(() => hook.result.current.undo()); // pointer at 0
            act(() => hook.result.current.push(makeChange("b", "z", otherPath))); // replaces "b->c"

            expect(hook.result.current.canRedo).toBe(false);

            act(() => hook.result.current.undo()); // restores "b"
            expect(setData).toHaveBeenLastCalledWith(otherPath, "b");

            act(() => hook.result.current.undo()); // restores "a"
            expect(setData).toHaveBeenLastCalledWith(path, "a");

            expect(hook.result.current.canUndo).toBe(false);
        });

        it("respects maxSize by dropping the oldest entry", () => {
            const { hook, setData } = setup(2);
            // use distinct paths so nothing conflates
            const p1 = new FieldPath(["f", "one"]);
            const p2 = new FieldPath(["f", "two"]);
            const p3 = new FieldPath(["f", "three"]);
            act(() => hook.result.current.push(makeChange("a", "b", p1)));
            act(() => hook.result.current.push(makeChange("b", "c", p2)));
            act(() => hook.result.current.push(makeChange("c", "d", p3))); // p1 entry dropped
            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            expect(hook.result.current.canUndo).toBe(false);
            expect(setData).not.toHaveBeenCalledWith(p1, "a");
        });
    });

    describe("conflation", () => {
        it("merges consecutive pushes on the same path into one entry", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("", "a")));
            act(() => hook.result.current.push(makeChange("a", "ab")));
            act(() => hook.result.current.push(makeChange("ab", "abc")));

            // only one undo step should exist
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "");
            expect(hook.result.current.canUndo).toBe(false);
        });

        it("preserves the original prevValue across multiple conflations", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("original", "x")));
            act(() => hook.result.current.push(makeChange("x", "xy")));
            act(() => hook.result.current.push(makeChange("xy", "xyz")));

            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "original");
        });

        it("does not conflate pushes on different paths", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b", path)));
            act(() => hook.result.current.push(makeChange("x", "y", otherPath)));

            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(otherPath, "x");
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "a");
            expect(hook.result.current.canUndo).toBe(false);
        });

        it("does not conflate after an undo — push on same path starts a new entry", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("", "a")));
            act(() => hook.result.current.push(makeChange("a", "ab")));
            act(() => hook.result.current.undo()); // back to ""
            act(() => hook.result.current.push(makeChange("", "z"))); // new branch, no conflation with discarded

            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "");
            expect(hook.result.current.canUndo).toBe(false);
        });

        it("conflation produces a single redoable entry", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("", "a")));
            act(() => hook.result.current.push(makeChange("a", "ab")));
            act(() => hook.result.current.push(makeChange("ab", "abc")));
            act(() => hook.result.current.undo());

            expect(hook.result.current.canRedo).toBe(true);
            act(() => hook.result.current.redo());
            expect(setData).toHaveBeenLastCalledWith(path, "abc");
            expect(hook.result.current.canRedo).toBe(false);
        });
    });

    describe("undo", () => {
        it("calls setData with prevValue", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenCalledWith(path, "a");
        });

        it("moves the pointer back and disables canUndo when exhausted", () => {
            const { hook } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.undo());
            expect(hook.result.current.canUndo).toBe(false);
        });

        it("enables redo after undoing", () => {
            const { hook } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.undo());
            expect(hook.result.current.canRedo).toBe(true);
        });

        it("does nothing when there is nothing to undo", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.undo());
            expect(setData).not.toHaveBeenCalled();
        });

        it("undoes changes in reverse order", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b", path)));
            act(() => hook.result.current.push(makeChange("x", "y", otherPath))); // different path
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(otherPath, "x");
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "a");
        });
    });

    describe("redo", () => {
        it("calls setData with newValue", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.undo());
            act(() => hook.result.current.redo());
            expect(setData).toHaveBeenLastCalledWith(path, "b");
        });

        it("disables canRedo when the tip of the stack is reached", () => {
            const { hook } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.undo());
            act(() => hook.result.current.redo());
            expect(hook.result.current.canRedo).toBe(false);
        });

        it("does nothing when there is nothing to redo", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.redo());
            expect(setData).not.toHaveBeenCalled();
        });

        it("redoes changes in forward order", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange("a", "b", path)));
            act(() => hook.result.current.push(makeChange("x", "y", otherPath)));
            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            act(() => hook.result.current.redo());
            expect(setData).toHaveBeenLastCalledWith(path, "b");
            act(() => hook.result.current.redo());
            expect(setData).toHaveBeenLastCalledWith(otherPath, "y");
        });
    });

    describe("undo/redo roundtrip", () => {
        it("full undo then full redo restores the original sequence", () => {
            const { hook, setData } = setup();
            const p1 = new FieldPath(["f", "one"]);
            const p2 = new FieldPath(["f", "two"]);
            const p3 = new FieldPath(["f", "three"]);
            act(() => hook.result.current.push(makeChange(1, 2, p1)));
            act(() => hook.result.current.push(makeChange(2, 3, p2)));
            act(() => hook.result.current.push(makeChange(3, 4, p3)));

            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            expect(hook.result.current.canUndo).toBe(false);

            act(() => hook.result.current.redo());
            act(() => hook.result.current.redo());
            act(() => hook.result.current.redo());
            expect(hook.result.current.canRedo).toBe(false);

            expect(setData).toHaveBeenLastCalledWith(p3, 4);
        });
    });
});
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useHistory } from "../useHistory.ts";
import { FieldPath } from "../../FieldPath.ts";

const path = new FieldPath(["some", "field", "path"]);
function makeChange(prev: unknown, next: unknown) {
    return { path, prevValue: prev, newValue: next }
}

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
            act(() => hook.result.current.push(makeChange("b", "c")));
            act(() => hook.result.current.undo()); // pointer at 0
            act(() => hook.result.current.push(makeChange("b", "z"))); // replaces "b->c"
            expect(hook.result.current.canRedo).toBe(false);
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "b");
        });

        it("respects maxSize by dropping the oldest entry", () => {
            const { hook, setData } = setup(2);
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.push(makeChange("b", "c")));
            act(() => hook.result.current.push(makeChange("c", "d"))); // "a->b" dropped
            // undo twice — should only reach "b", not "a"
            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            expect(hook.result.current.canUndo).toBe(false);
            expect(setData).not.toHaveBeenCalledWith(path, "a");
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
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.push(makeChange("b", "c")));
            act(() => hook.result.current.undo());
            expect(setData).toHaveBeenLastCalledWith(path, "b");
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
            act(() => hook.result.current.push(makeChange("a", "b")));
            act(() => hook.result.current.push(makeChange("b", "c")));
            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            act(() => hook.result.current.redo());
            expect(setData).toHaveBeenLastCalledWith(path, "b");
            act(() => hook.result.current.redo());
            expect(setData).toHaveBeenLastCalledWith(path, "c");
        });
    });

    describe("undo/redo roundtrip", () => {
        it("full undo then full redo restores the original sequence", () => {
            const { hook, setData } = setup();
            act(() => hook.result.current.push(makeChange(1, 2)));
            act(() => hook.result.current.push(makeChange(2, 3)));
            act(() => hook.result.current.push(makeChange(3, 4)));

            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            act(() => hook.result.current.undo());
            expect(hook.result.current.canUndo).toBe(false);

            act(() => hook.result.current.redo());
            act(() => hook.result.current.redo());
            act(() => hook.result.current.redo());
            expect(hook.result.current.canRedo).toBe(false);

            expect(setData).toHaveBeenLastCalledWith(path, 4);
        });
    });
});

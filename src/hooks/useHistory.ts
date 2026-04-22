import { useCallback, useRef, useState } from "react";
import type { FieldPath } from "../FieldPath.ts";

type Change<T> = {
    path: FieldPath
    prevValue: T
    newValue: T
}

type HistoryState = {
    stack: Change<unknown>[]
    pointer: number
}

type Opts = {
    maxSize: number
    setData: (fieldPath: FieldPath, value: unknown) => void
}

export function useHistory({ maxSize, setData }: Opts) {
    const historyRef = useRef<HistoryState>({ stack: [], pointer: -1 });
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const setHistory = useCallback((history: HistoryState) => {
        historyRef.current = history;
        setCanUndo(history.stack.length > 0 && history.pointer >= 0);
        setCanRedo(history.stack.length > 0 && history.pointer < history.stack.length - 1)
    }, []);

    const push = useCallback((change: Change<unknown>) => {
        const prev = historyRef.current;
        const base = prev.stack.slice(0, prev.pointer + 1);
        const last = base[base.length - 1];

        const merged = last && last.path.equals(change.path)
            ? [...base.slice(0, -1), { ...last, newValue: change.newValue }]
            : [...base, change];

        const trimmed =
            merged.length > maxSize ? merged.slice(merged.length - maxSize) : merged;
        setHistory({ stack: trimmed, pointer: trimmed.length - 1 });
    }, [maxSize]);

    const undo = useCallback(() => {
        const prev = historyRef.current;
        if (prev.pointer < 0) return;
        const change = prev.stack[prev.pointer];
        setData(change.path, change.prevValue);
        setHistory({ ...prev, pointer: prev.pointer - 1 });
    }, [setData]);

    const redo = useCallback(() => {
        const prev = historyRef.current;
        if (prev.pointer >= prev.stack.length - 1) return;
        const change = prev.stack[prev.pointer + 1];
        setData(change.path, change.newValue);
        setHistory({ ...prev, pointer: prev.pointer + 1 });
    }, [setData]);

    return {
        canUndo,
        canRedo,
        undo,
        redo,
        push,
    }
}
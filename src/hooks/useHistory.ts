import { useCallback, useState } from "react";
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
    const [state, setState] = useState<HistoryState>({ stack: [], pointer: -1 });

    const push = useCallback((change: Change<unknown>) => {
        setState(prev => {
            // Slice off any "future" entries if we're mid-stack, then append
            const base = prev.stack.slice(0, prev.pointer + 1);
            const last = base[base.length - 1];

            const merged = last && last.path.equals(change.path)
                ? [...base.slice(0, -1), { ...last, newValue: change.newValue }]
                : [...base, change];

            const trimmed =
                merged.length > maxSize ? merged.slice(merged.length - maxSize) : merged;

            return { stack: trimmed, pointer: trimmed.length - 1 };
        });
    }, [maxSize]);

    const undo = useCallback(() => {
        setState(prev => {
            if (prev.pointer < 0) return prev;
            const change = prev.stack[prev.pointer];
            setData(change.path, change.prevValue);
            return { ...prev, pointer: prev.pointer - 1 };
        });
    }, [setData]);

    const redo = useCallback(() => {
        setState(prev => {
            if (prev.pointer >= prev.stack.length - 1) return prev;
            const change = prev.stack[prev.pointer + 1];
            setData(change.path, change.newValue);
            return { ...prev, pointer: prev.pointer + 1 };
        });
    }, [setData]);

    return {
        canUndo: state.stack.length > 0 && state.pointer >= 0,
        canRedo: state.stack.length > 0 && state.pointer < state.stack.length - 1,
        undo,
        redo,
        push,
    }
}
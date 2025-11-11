import type { FormState, FormStateType } from "../FormStateManager.ts";
import { useCallback, useSyncExternalStore } from "react";
import type { FormWithInternals } from "./useForm.ts";

export function useSyncState<T extends FormStateType>(form: FormWithInternals, state: T): FormState[T] {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            const unsubscribe = form.__internal.subscribeToState(state, onStoreChange);
            return () => unsubscribe();
        }, [form, state]),
        // Get snapshot
        () => form.__internal.getState(state),
        // Get server snapshot
        () => form.__internal.getState(state)
    );
}

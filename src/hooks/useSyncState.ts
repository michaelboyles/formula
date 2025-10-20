import type { FormState, FormStateType } from "../FormStateManager.ts";
import { useCallback, useSyncExternalStore } from "react";
import type { _Form } from "./useForm.ts";

export function useSyncState<T extends FormStateType>(form: _Form, state: T): FormState[T] {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            const unsubscribe = form.subscribeToState(state, onStoreChange);
            return () => unsubscribe();
        }, [form, state]),
        // Get snapshot
        () => form.getState(state),
        // Get server snapshot
        () => form.getState(state)
    );
}

import { FormState, FormStateType } from "./FormStateManager";
import { useSyncExternalStore } from "react";
import { _Form } from "./useForm";

export function useSyncState<T extends FormStateType>(form: _Form, state: T): FormState[T] {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = form.subscribeToState(state, onStoreChange);
            return () => unsubscribe();
        },
        // Get snapshot
        () => form.getState(state),
        // Get server snapshot
        () => form.getState(state)
    );
}

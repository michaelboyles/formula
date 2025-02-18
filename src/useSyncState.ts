import { FormStateType } from "./FormStateManager";
import { useSyncExternalStore } from "react";
import { _Form } from "./useForm";

export function useSyncState(form: _Form, state: FormStateType) {
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

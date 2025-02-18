import { Form, isInternalForm } from "./useForm";
import { useSyncExternalStore } from "react";

export function useIsSubmitting(form: Form<any, any>) {
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }

    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = form.subscribeToState("isSubmitting", onStoreChange);
            return () => unsubscribe();
        },
        // Get snapshot
        () => form.getState("isSubmitting")
    );
}
import type { Form } from "./useForm.ts";
import { isInternalForm } from "./useForm.ts";
import { useSyncState } from "./useSyncState";

export function useIsSubmitting(form: Form<any>): boolean {
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "isSubmitting");
}

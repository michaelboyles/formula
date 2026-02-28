import type { Form } from "./useForm.ts";
import { isInternalForm } from "./useForm.ts";
import { useSyncState } from "./useSyncState.ts";
import type { Nullable } from "../types.ts";

export function useIsSubmitting<T>(form: Nullable<Form<T>>): boolean {
    if (form == null) return false;
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "isSubmitting");
}

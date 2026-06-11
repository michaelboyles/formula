import type { Form } from "./useForm.ts";
import { isInternalForm } from "./useForm.ts";
import { useSyncState } from "./useSyncState.ts";
import type { Nullable } from "../types.ts";

/**
 * A hook which returns whether the given form is in the process of being submitted. This includes pre-submission
 * validation and submission itself (e.g. async API request).
 *
 * @param form the form to get the submission status for
 */
export function useIsSubmitting<T>(form: Nullable<Form<T>>): boolean {
    if (form == null) return false;
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "isSubmitting");
}

import { type Form, isInternalForm } from "./useForm.ts";
import { useSyncState } from "./useSyncState.ts";
import type { Nullable } from "../types.ts";

export function useSubmissionError<T>(form: Nullable<Form<T>>): Error | undefined {
    if (form == null) return undefined;
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "submissionError");
}

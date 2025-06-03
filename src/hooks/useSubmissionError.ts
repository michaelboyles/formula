import { type Form, isInternalForm } from "./useForm.ts";
import { useSyncState } from "./useSyncState.ts";

export function useSubmissionError(form: Form<any>): Error | undefined {
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "submissionError");
}

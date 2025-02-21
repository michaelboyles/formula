import { Form, isInternalForm } from "./useForm";
import { useSyncState } from "./useSyncState";

export function useSubmissionError(form: Form<any>): unknown {
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "submissionError");
}
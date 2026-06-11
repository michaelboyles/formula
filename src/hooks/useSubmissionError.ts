import { type Form, isInternalForm } from "./useForm.ts";
import { useSyncState } from "./useSyncState.ts";
import type { Nullable } from "../types.ts";

/**
 * A hook which accepts a form and returns the Error that was thrown when the form was last submitted. Returns
 * `undefined` if the last submission was successful, or submission hasn't been attempted.
 *
 * If a non-Error was thrown, then the value which was thrown will be wrapped in an Error and Error#cause will be set.
 *
 * @param form The form to get the submission error for. If falsey, the result will be `undefined`.
 */
export function useSubmissionError<T>(form: Nullable<Form<T>>): Error | undefined {
    if (form == null) return undefined;
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "submissionError");
}

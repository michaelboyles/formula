import { Form, isInternalForm } from "./useForm";
import { useSyncState } from "./useSyncState";

export function useIsSubmitting(form: Form<any, any>) {
    if (!isInternalForm(form)) {
        throw new Error("Invalid form");
    }
    return useSyncState(form, "isSubmitting");
}
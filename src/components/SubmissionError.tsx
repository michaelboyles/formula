import type { ReactNode } from "react";
import type { Form } from "../hooks/useForm.ts";
import { useSubmissionError } from "../hooks/useSubmissionError.ts";

export type Props<T> = {
    // The form to watch for submission errors
    form: Form<T>
    // A render function which will be passed the submission error, if any
    children: (submissionError: Error | undefined) => ReactNode
}
export function SubmissionError<T>(props: Props<T>) {
    const submissionError = useSubmissionError(props.form);
    return props.children(submissionError);
}

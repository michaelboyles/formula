import type { ReactNode } from "react";
import type { Form } from "./hooks/useForm.ts";
import { useSubmissionError } from "./hooks/useSubmissionError.ts";

export type Props = {
    form: Form<any>
    children: (submissionError: Error | undefined) => ReactNode
}
export function SubmissionError(props: Props) {
    const submissionError = useSubmissionError(props.form);
    return props.children(submissionError);
}

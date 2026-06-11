import type { ReactNode } from "react";
import type { Form } from "../hooks/useForm.ts";
import { useIsSubmitting } from "../hooks/useIsSubmitting.ts";

export type IsSubmittingProps<T> = {
    /** The form to watch the isSubmitting status for */
    form: Form<T>
    /** A render function which will be passed the isSubmitting status */
    children: (isSubmitting: boolean) => ReactNode
}
export function IsSubmitting<T>(props: IsSubmittingProps<T>) {
    const isSubmitting = useIsSubmitting(props.form);
    return props.children(isSubmitting);
}

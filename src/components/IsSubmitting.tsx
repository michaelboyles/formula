import type { ReactNode } from "react";
import type { Form } from "../hooks/useForm.ts";
import { useIsSubmitting } from "../hooks/useIsSubmitting.ts";

export type Props = {
    // The form to watch the isSubmitting status for
    form: Form<any>
    // A render function which will be passed the isSubmitting status
    children: (isSubmitting: boolean) => ReactNode
}
export function IsSubmitting(props: Props) {
    const isSubmitting = useIsSubmitting(props.form);
    return props.children(isSubmitting);
}

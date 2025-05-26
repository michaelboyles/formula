import type { ReactNode } from "react";
import type { Form } from "./useForm.ts";
import { useIsSubmitting } from "./useIsSubmitting.ts";

export type Props = {
    form: Form<any>
    children: (isSubmitting: boolean) => ReactNode
}
export function IsSubmitting(props: Props) {
    const isSubmitting = useIsSubmitting(props.form);
    return props.children(isSubmitting);
}

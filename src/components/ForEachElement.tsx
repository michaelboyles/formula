import type { FormField } from "../FormField.ts";
import { Fragment, type ReactNode } from "react";
import { useElements } from "../hooks/useElements.ts";

export type ForEachElementProps<T> = {
    /** The array field to iterate over */
    field: FormField<T[]>

    /** A render function that will be used for each child */
    children: (
        /** The child to render */
        element: FormField<NoInfer<T>>,
        /** The index of the child to render. Mostly useful for removing by index */
        idx: number
    ) => ReactNode;
}
export function ForEachElement<T>({ field, children }: ForEachElementProps<T>): ReactNode[] {
    const elements = useElements(field);
    return (
        elements.map((element, idx) => <Fragment key={idx}>{ children(element, idx) }</Fragment>)
    );
}

import type { FormField } from "../FormField.ts";
import { Fragment, ReactNode } from "react";
import { useElements } from "../hooks/useElements.ts";

export type Props<T> = {
    // The array field to iterate over
    field: FormField<T[]>

    // A render function that will be used for each child
    // `element`: the child to render
    // `idx`: the index of the child to render. Mostly useful for removing by index
    children: (element: FormField<NoInfer<T>>, idx: number) => ReactNode;
}
export function ForEachElement<T>({ field, children }: Props<T>) {
    const elements = useElements(field);
    return (
        <>
        {
            elements.map((element, idx) => <Fragment key={idx}>{ children(element, idx) }</Fragment>)
        }
        </>
    );
}

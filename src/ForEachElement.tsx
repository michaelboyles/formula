import type { FormField } from "./FormField.ts";
import { Fragment, ReactNode } from "react";
import { useElements } from "./hooks/useElements.ts";

export type Props<T> = {
    field: FormField<T[]>
    children: (element: FormField<T>, idx: number) => ReactNode;
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

import type { FormField } from "./FormField";
import { Fragment, ReactNode } from "react";
import { useElements } from "./useElements";

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

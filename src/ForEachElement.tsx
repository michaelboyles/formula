import type { ArrayField, FieldFromNative } from "./FormField";
import { Fragment, ReactNode } from "react";
import { useElements } from "./useElements";

export type Props<T> = {
    field: ArrayField<T>
    children: (element: FieldFromNative<T>, idx: number) => ReactNode;
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

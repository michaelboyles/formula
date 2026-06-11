import type { FormField } from "../FormField.ts";
import type { ComponentProps } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";

export type TextAreaProps = {
    /** The field to associate with this textarea */
    field: FormField<string>
} & Omit<ComponentProps<"textarea">, "value">;
export function TextArea(props: TextAreaProps) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFieldData(field);
    return (
        <textarea
            {...rest}
            value={value}
            onChange={e => {
                field.setData(e.target.value);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    );
}

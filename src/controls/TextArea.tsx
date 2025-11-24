import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
export type Props = {
    // The field to associate with this textarea
    field: FormField<string>
} & Omit<DefaultInputProps, "value">;
export function TextArea(props: Props) {
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
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    );
}

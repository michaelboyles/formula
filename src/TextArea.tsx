import { FormField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFormValue } from "./useFormValue";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
export type Props = {
    field: FormField<string>
} & Omit<DefaultInputProps, "value">;
export function TextArea(props: Props) {
    let { field, onChange, onBlur, ...rest } = props;
    const value = useFormValue(field);
    return (
        <textarea
            {...rest} value={value}
            onChange={e => {
                field.setValue(e.target.value);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setTouched(true);
                onBlur?.(e);
            }}
        />
    );
}

import { FormField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFormValue } from "./useFormValue";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<string>
    type?: "text" | "password" | "email" | "search" | "tel" | "url"
} & Omit<DefaultInputProps, "type" | "onChange" | "value">;
export function Input(props: Props) {
    let { field, type, ...rest } = props;
    const value = useFormValue(field);
    if (!type) type = "text";
    return (
        <input
            {...rest} type={type} value={value}
            onChange={e => field.setValue(e.target.value)}
            onBlur={() => field.setTouched(true)}
        />
    );
}

import { FormField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFormValue } from "./useFormValue";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<boolean>
} & Omit<DefaultCheckboxProps, "type" | "checked">;
export function Checkbox(props: Props) {
    const { field, onChange, ...rest } = props;
    const value = useFormValue(field);
    return (
        <input
            {...rest}
            type="checkbox"
            onChange={e => {
                field.setValue(e.target.checked);
                onChange?.(e);
            }}
            checked={value}
        />
    )
}

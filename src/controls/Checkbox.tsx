import type { FormField } from "../FormField";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../useFieldValue";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<boolean>
} & Omit<DefaultCheckboxProps, "type" | "checked">;
export function Checkbox(props: Props) {
    const { field, onChange, ...rest } = props;
    const value = useFieldValue(field);
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

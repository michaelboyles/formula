import type { FormField } from "../FormField";
import { useFormValue } from "../useFormValue";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<"" | number>
} & Omit<DefaultInputProps, "type" | "value">;
export function IntegerInput(props: Props) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFormValue(field);

    return (
        <input
            {...rest}
            type="number"
            value={value}
            onChange={e => {
                const value = e.target.value;
                if (value === "") {
                    field.setValue(value);
                    onChange?.(e);
                    return;
                }
                const number = Number(value);
                if (Number.isSafeInteger(number)) {
                    field.setValue(number);
                }
                else {
                    field.setValue(Math.round(number));
                }
                onChange?.(e);
            }}
            onBlur={e => {
                field.setTouched(true);
                onBlur?.(e);
            }}
        />
    )
}

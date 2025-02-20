import { FormField } from "./FormField";
import { useFormValue } from "./useFormValue";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<"" | number>
} & Omit<DefaultInputProps, "type" | "value" | "onChange">;
export function IntegerInput(props: Props) {
    let { field, ...rest } = props;
    const value = useFormValue(field);

    return (
        <input {...rest} type="number" value={value} onChange={e => {
            const value = e.target.value;
            if (value === "") {
                field.setValue(value);
                return;
            }
            const number = Number(value);
            if (Number.isSafeInteger(number)) {
                field.setValue(number);
            }
            else {
                field.setValue(Math.round(number));
            }
        }}/>
    )
}
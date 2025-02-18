import { BooleanField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFormValue } from "./useFormValue";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: BooleanField
} & Omit<DefaultCheckboxProps, "type" | "onChange" | "checked">;
export function Checkbox(props: Props) {
    const { field, ...rest } = props;
    const value = useFormValue(field);
    return <input {...rest} type="checkbox" onChange={e => field.setValue(e.target.checked)} checked={value} />
}

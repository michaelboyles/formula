import { StringField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useSyncFieldValue } from "./useSyncFieldValue";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: StringField
    type?: "text" | "password" | "email" | "search" | "tel" | "url"
} & Omit<DefaultInputProps, "type" | "onChange" | "value">;
export function Input(props: Props) {
    let { field, type, ...rest } = props;
    const value = useSyncFieldValue(field);
    if (!type) type = "text";
    return <input {...rest} type={type} onChange={e => field.setValue(e.target.value)} value={value} />;
}

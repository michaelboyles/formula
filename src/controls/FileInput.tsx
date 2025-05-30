import type { FormField } from "../FormField.ts";
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes, useEffect, useRef } from "react";
import { useForkRef } from "../hooks/useForkRef.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this file input
    field: FormField<FileList | null>
} & Omit<DefaultInputProps, "type">;

export const FileInput = forwardRef<HTMLInputElement, Props>((props, forwardedRef) => {
    const { field, onChange, onBlur, ...rest } = props;
    const ref = useRef<HTMLInputElement>(null);
    const forkedRef = useForkRef(forwardedRef, ref);

    const value = useFieldValue(field);
    useEffect(() => {
        if (!ref.current) return;
        if (value) {
            ref.current.files = value;
        }
        else {
            ref.current.value = "";
        }
    }, [value]);

    return (
        <input
            {...rest}
            ref={forkedRef}
            type="file"
            onChange={e => {
                field.setValue(e.target.files ?? null);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    );
});

import type { FormField } from "../FormField.ts";
import { type ComponentProps, forwardRef, useEffect, useRef } from "react";
import { useForkRef } from "../hooks/useForkRef.ts";
import { useFieldData } from "../hooks/useFieldData.ts";

export type FileInputProps = {
    /** The field to associate with this file input */
    field: FormField<FileList | null>
} & Omit<ComponentProps<"input">, "type">;

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>((props, forwardedRef) => {
    const { field, onChange, onBlur, ...rest } = props;
    const ref = useRef<HTMLInputElement>(null);
    const forkedRef = useForkRef(forwardedRef, ref);

    const data = useFieldData(field);
    useEffect(() => {
        if (!ref.current) return;
        if (data) {
            if (ref.current.files !== data) {
                ref.current.files = data;
            }
        }
        else {
            ref.current.value = "";
        }
    }, [data]);

    return (
        <input
            {...rest}
            ref={forkedRef}
            type="file"
            onChange={e => {
                field.setData(e.target.files ?? null);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    );
});

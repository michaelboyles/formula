import { FormSchema } from "./lib";
import { useCallback, useMemo, useRef } from "react";
import { ArrayElement, FormSchemaElement, NumberElement, ObjectElement, StringElement } from "./FormSchemaElement";
import { FieldFromElem, FormField, NumberField, StringField } from "./FormField";

type SchemaElementSet = Record<string, FormSchemaElement>;

type UseFormOpts<T extends SchemaElementSet> = {
    schema: FormSchema<T>
    getInitialValues(): InitialValues<T>
}

type SchemaValue<T extends FormSchemaElement> =
    T extends StringElement ? string :
        T extends NumberElement ? number :
            T extends ObjectElement<infer O> ? { [K in keyof O]: SchemaValue<O[K]> }:
                T extends ArrayElement<infer A> ? SchemaValue<A>[] : never;

type InitialValues<T extends SchemaElementSet> = {
    [K in keyof T]: SchemaValue<T[K]>
};

export function useForm<T extends SchemaElementSet>(opts: UseFormOpts<T>): Form<FieldFromElem<T>> {
    const data = useRef<Record<string, any>>({  });

    const { schema, getInitialValues } = opts;

    const getValue = useCallback((path: string) => {
        return data.current[path];
    }, []);

    const setValue = useCallback((path: string, value: any) => {
        data.current[path] = value;
    }, []);

    const form = useMemo(() => {
        data.current = getInitialValues();

        const fields: Record<string, FormField> = {};
        for (const [key, value] of Object.entries(schema.elements)) {
            const element = value as FormSchemaElement;
            if (element.type === "string") {
                fields[key] = new StringField(key);
            }
            else if (element.type === "number") {
                fields[key] = new NumberField(key);
            }
        }
        return new Form<FieldFromElem<T>>(fields as any, getValue, setValue);

    }, [schema]);

    return form;
}

export class Form<T extends Record<string, FormField>> {
    fields: T
    _valueGetter: (path: string) => any
    _valueSetter: (path: string, value: any) => void


    constructor(fields: T, valueGetter: (path: string) => any, valueSetter: (path: string, value: any) => void) {
        this.fields = fields;
        this._valueGetter = valueGetter;
        this._valueSetter = valueSetter;
        for (const field of Object.values(this.fields)) {
            field.setForm(this);
        }
    }

    get<K extends keyof T>(a: K): T[K] {
        return this.fields[a];
    }

    subscribe() {

    }

    getValue(path: string): any {
        return this._valueGetter(path);
    }

    setValue(path: string, value: any) {
        return this._valueSetter(path, value);
    }
}
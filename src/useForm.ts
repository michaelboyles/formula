import {
    ArrayElement,
    Field,
    FormSchema,
    FormSchemaElement,
    NumberElement,
    ObjectElement,
    StringElement,
    StringField,
    Test
} from "./lib";
import { useCallback, useMemo, useRef } from "react";

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

export function useForm<T extends SchemaElementSet>(opts: UseFormOpts<T>) {
    const data = useRef<Record<string, any>>({  });

    const { schema, getInitialValues } = opts;

    const getValue = useCallback((path: string) => {
        return data.current[path];
    }, []);

    const form = useMemo(() => {
        data.current = getInitialValues();

        const fields = {};
        for (const [key, value] of Object.entries(schema.elements)) {
            const element = value as FormSchemaElement;
            if (element.type === "string") {
                fields[key] = new StringField(key);
            }
        }

        // @ts-ignore
        return new Form<Test<T>>(fields, getValue);

    }, [schema]);

    return form;
}


export class Form<T extends Record<string, Field>> {
    fields: T
    _valueGetter: (path: string) => any

    constructor(fields: T, valueGetter: (path: string) => any) {
        this.fields = fields;
        this._valueGetter = valueGetter;
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
}
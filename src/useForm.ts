import { FormSchema } from "./lib";
import { useCallback, useMemo, useRef } from "react";
import { FormSchemaElement, SchemaElementSet, SchemaValue } from "./FormSchemaElement";
import { ArrayField, FieldSetFromElementSet, FormField, NumberField, StringField } from "./FormField";

type UseFormOpts<T extends SchemaElementSet> = {
    schema: FormSchema<T>
    getInitialValues(): InitialValues<T>
}

type InitialValues<T extends SchemaElementSet> = {
    [K in keyof T]: SchemaValue<T[K]>
};

export function useForm<T extends SchemaElementSet>(opts: UseFormOpts<T>): Form<FieldSetFromElementSet<T>> {
    const data = useRef<Record<string, any>>({  });
    const pathToSubscriber = useRef<Record<string, Subscriber[]>>({});

    const { schema, getInitialValues } = opts;

    const getValue = useCallback((path: string) => {
        return data.current[path];
    }, []);

    const setValue = useCallback((path: string, value: any) => {
        data.current[path] = value;

        const subscribers = pathToSubscriber.current[path];
        if (subscribers) {
            subscribers.forEach(subscriber => {
                subscriber()
            })
        }
    }, []);

    const subscribe = useCallback((path: string, subscriber: Subscriber) => {
        const p2s = pathToSubscriber.current;
        if (!p2s[path]) {
            p2s[path] = [];
        }
        p2s[path].push(subscriber);

        return () => {
            const p2s = pathToSubscriber.current;
            if (p2s[path]) {
                p2s[path] = p2s[path].filter(s => s !== subscriber);
            }
        }
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
            else if (element.type === "array") {
                fields[key] = new ArrayField(key);
            }
        }
        return new Form<FieldSetFromElementSet<T>>(
            fields as any, getValue, setValue, subscribe
        );

    }, [schema]);

    return form;
}

export class Form<T extends Record<string, FormField>> {
    fields: T
    _valueGetter: (path: string) => any
    _valueSetter: (path: string, value: any) => void
    _subscribe: (path: string, subscriber: Subscriber) => Unsubscribe

    constructor(fields: T,
                valueGetter: (path: string) => any,
                valueSetter: (path: string, value: any) => void,
                subscribe: (path: string, subscriber: Subscriber) => Unsubscribe
    ) {
        this.fields = fields;
        this._valueGetter = valueGetter;
        this._valueSetter = valueSetter;
        this._subscribe = subscribe;
        for (const field of Object.values(this.fields)) {
            field.setForm(this);
        }
    }

    get<K extends keyof T>(a: K): T[K] {
        return this.fields[a];
    }

    subscribe(path: string, subscriber: Subscriber): Unsubscribe {
        return this._subscribe(path, subscriber);
    }

    getValue(path: string): any {
        return this._valueGetter(path);
    }

    setValue(path: string, value: any) {
        return this._valueSetter(path, value);
    }
}

export type Unsubscribe = () => void;
export type Subscriber = () => void;
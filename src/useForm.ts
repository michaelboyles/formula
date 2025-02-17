import { FormSchema } from "./lib";
import { useCallback, useMemo, useRef } from "react";
import { FormSchemaElement, ObjectSchema, SchemaElementSet, SchemaValue } from "./FormSchemaElement";
import { ArrayField, FieldSetFromElementSet, FormField, NumberField, ObjectField, StringField } from "./FormField";
import { FieldPath } from "./FieldPath";
import { Subscriber, SubscriberSet, Unsubscribe } from "./SubscriberSet";

type UseFormOpts<T extends SchemaElementSet> = {
    schema: FormSchema<T>
    getInitialValues(): InitialValues<T>
}

type InitialValues<T extends SchemaElementSet> = {
    [K in keyof T]: SchemaValue<T[K]>
};

export function useForm<T extends SchemaElementSet>(opts: UseFormOpts<T>): Form<FieldSetFromElementSet<T>> {
    const data = useRef<Record<string, any>>({  });
    const subscriberSet = useRef<SubscriberSet>(new SubscriberSet());

    const { schema, getInitialValues } = opts;

    const getValue = useCallback((path: FieldPath) => path.getValue(data.current), []);

    const setValue = useCallback((path: FieldPath, value: any) => {
        data.current = path.getDataWithValue(data.current, value);
        subscriberSet.current.notify(path);
    }, []);

    const subscribe = useCallback((path: FieldPath, subscriber: Subscriber) => {
        subscriberSet.current.subscribe(path, subscriber);
        return () => subscriberSet.current.unsubscribe(path, subscriber);
    }, []);

    const form = useMemo(() => {
        data.current = getInitialValues();

        const fields: Record<string, FormField> = {};
        let path = FieldPath.create();
        for (const [key, value] of Object.entries(schema.elements)) {
            const element = value as FormSchemaElement;
            fields[key] = mapElementToField(element, path.withProperty(key));
        }
        return new Form<FieldSetFromElementSet<T>>(
            fields as any, getValue, setValue, subscribe
        );

    }, [schema]);

    return form;
}

function mapElementToField(element: FormSchemaElement, path: FieldPath): FormField {
    if (element.type === "string") {
        return new StringField(path);
    }
    else if (element.type === "number") {
        return new NumberField(path);
    }
    else if (element.type === "array") {
        return new ArrayField(path, idx => mapElementToField(element.item, path.withArrayIndex(idx)));
    }
    else if (element.type === "object") {
        const properties: ObjectSchema = element.properties;
        const keyToFactory: any = {};
        for (const [key, value] of Object.entries(properties)) {
            keyToFactory[key] = () => mapElementToField(value, path.withProperty(key));
        }
        return new ObjectField(path, keyToFactory);
    }
    throw new Error(`Unsupported element: ${element satisfies never}`);
}

export class Form<T extends Record<string, FormField>> {
    fields: T
    _valueGetter: (path: FieldPath) => any
    _valueSetter: (path: FieldPath, value: any) => void
    _subscribe: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

    constructor(fields: T,
                valueGetter: (path: FieldPath) => any,
                valueSetter: (path: FieldPath, value: any) => void,
                subscribe: (path: FieldPath, subscriber: Subscriber) => Unsubscribe
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

    subscribe(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this._subscribe(path, subscriber);
    }

    getValue(path: FieldPath): any {
        return this._valueGetter(path);
    }

    setValue(path: FieldPath, value: any) {
        return this._valueSetter(path, value);
    }
}

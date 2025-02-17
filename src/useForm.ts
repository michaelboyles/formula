import { useCallback, useMemo, useRef } from "react";
import {
    FormSchemaElement,
    ObjectSchema,
    SchemaElementSet,
    SchemaValue,
} from "./FormSchemaElement";
import {
    ArrayField,
    BooleanField,
    FieldSetFromElementSet,
    FormField,
    NumberField,
    ObjectField,
    StringField
} from "./FormField";
import { FieldPath } from "./FieldPath";
import { Subscriber, SubscriberSet, Unsubscribe } from "./SubscriberSet";
import { FormSchema } from "./FormSchema";

type UseFormOpts<T extends SchemaElementSet> = {
    schema: FormSchema<T>
    getInitialValues(): FormData<T>
}

type FormData<T extends SchemaElementSet> = {
    [K in keyof T]: SchemaValue<T[K]>
};

export function useForm<T extends SchemaElementSet>(opts: UseFormOpts<T>): Form<FormData<T>, FieldSetFromElementSet<T>> {
    const data = useRef<FormData<T>>(opts.getInitialValues());
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
        const formAccess: FormAccess = {
            getValue: getValue,
            setValue: setValue,
            subscribe: subscribe
        }

        const fields: Record<string, FormField> = {};
        const rootPath = FieldPath.create();
        for (const [key, value] of Object.entries(schema.elements)) {
            const element = value as FormSchemaElement;
            fields[key] = mapElementToField(element, rootPath.withProperty(key));
            fields[key].setFormAccess(formAccess);
        }
        return {
            get(key: any) {
                return fields[key as string] as any;
            },
            getData() {
                return data.current;
            },
            setData(data: any) {
                setValue(rootPath, data);
            },
            resetData() {
                setValue(rootPath, getInitialValues());
            }
        };
    }, [schema]);

    return form;
}

function mapElementToField(element: FormSchemaElement, path: FieldPath): FormField {
    if (typeof element === "function") {
        return mapElementToField(element(), path);
    }

    if (element.type === "string") {
        return new StringField(path);
    }
    else if (element.type === "number") {
        return new NumberField(path);
    }
    else if (element.type === "bool") {
        return new BooleanField(path);
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

export type Form<D, T extends Record<string, FormField>> = {
    get<K extends keyof T>(key: K): T[K]

    getData(): D

    setData(data: D): void

    resetData(): void
}

export type FormAccess = {
    subscribe(path: FieldPath, subscriber: Subscriber): Unsubscribe;

    getValue(path: FieldPath): any;

    setValue(path: FieldPath, value: any): void;
}

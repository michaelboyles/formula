import { FormSchema } from "./lib";
import { useCallback, useMemo, useRef } from "react";
import { FormSchemaElement, SchemaElementSet, SchemaValue } from "./FormSchemaElement";
import { ArrayField, FieldSetFromElementSet, FormField, NumberField, StringField } from "./FormField";
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

    const getValue = useCallback((path: FieldPath) => {
        let formData = data.current;
        path.forEachNode(node => {
            switch (node.type) {
                case "property": {
                    formData = formData[node.name];
                }
            }
        });
        return formData;
    }, []);

    const setValue = useCallback((path: FieldPath, value: any) => {
        let formData = data.current;
        path.forEachNode((node, { isLast }) => {
            if (!isLast) {
                switch (node.type) {
                    case "property": {
                        formData = formData[node.name];
                    }
                }
            }
            else {
                switch (node.type) {
                    case "property": {
                        formData[node.name] = value;
                    }
                }
            }
        });
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
            if (element.type === "string") {
                fields[key] = new StringField(path.withProperty(key));
            }
            else if (element.type === "number") {
                fields[key] = new NumberField(path.withProperty(key));
            }
            else if (element.type === "array") {
                fields[key] = new ArrayField(path.withProperty(key));
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

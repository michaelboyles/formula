import { FormEvent, useCallback, useMemo, useRef } from "react";
import {
    FormSchemaElement,
    ObjectSchema,
    SchemaElementSet,
    SchemaValue,
} from "./FormSchemaElement";
import {
    ArrayField,
    BooleanField,
    FieldSet,
    FieldSetFromElementSet,
    FormField,
    NumberField,
    ObjectField,
    StringField
} from "./FormField";
import { FieldPath } from "./FieldPath";
import { Subscriber, SubscriberSet, Unsubscribe } from "./SubscriberSet";
import { FormSchema } from "./FormSchema";
import { FormStateType, StateSubscriber, FormStateManager, UnsubscribeFromState } from "./FormStateManager";

type UseFormOpts<T extends SchemaElementSet, R> = {
    schema: FormSchema<T>
    getInitialValues(): FormData<T>
    submit(data: FormData<T>): Promise<R>

    // Optional
    onSuccess?(result: R): void
    onError?(error: unknown): void
}

type FormData<T extends SchemaElementSet> = {
    [K in keyof T]: SchemaValue<T[K]>
};

export type FormForSchema<T extends FormSchema<any>> = T extends FormSchema<infer A> ? Form<FormData<A>, FieldSetFromElementSet<A>> : never;
export type FormDataForSchema<T extends FormSchema<any>> = T extends FormSchema<infer A> ? FormData<A> : never;

const ROOT_PATH = FieldPath.create();

export function useForm<T extends SchemaElementSet, R>(opts: UseFormOpts<T, R>): FormForSchema<FormSchema<T>> {
    const data = useRef(opts.getInitialValues());
    const subscriberSet = useRef(new SubscriberSet());
    const stateManager = useRef(new FormStateManager());

    const { schema, getInitialValues, submit: submitForm, onSuccess, onError } = opts;

    const getValue = useCallback((path: FieldPath) => path.getValue(data.current), []);

    const setValue = useCallback((path: FieldPath, value: any) => {
        data.current = path.getDataWithValue(data.current, value);
        subscriberSet.current.notify(path);
    }, []);

    const subscribe = useCallback((path: FieldPath, subscriber: Subscriber) => {
        subscriberSet.current.subscribe(path, subscriber);
        return () => subscriberSet.current.unsubscribe(path, subscriber);
    }, []);

    const submit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (stateManager.current.getValue("isSubmitting")) {
            console.log("Skipping dupe submission");
            return;
        }
        stateManager.current.setValue("isSubmitting", true);
        stateManager.current.setValue("submissionError", undefined);

        try {
            const result = await submitForm(data.current);
            onSuccess?.(result);
        }
        catch (e) {
            stateManager.current.setValue("submissionError", e);
            onError?.(e);
        }
        stateManager.current.setValue("isSubmitting", false);
    }, [submitForm, onSuccess, onError]);

    const fields = useMemo(() => {
        const formAccess: FormAccess = {
            getValue: getValue,
            setValue: setValue,
            subscribe: subscribe
        }

        const fields: FieldSet = {};
        for (const [key, value] of Object.entries(schema.elements)) {
            const element = value as FormSchemaElement;
            fields[key] = mapElementToField(element, formAccess, ROOT_PATH.withProperty(key));
        }
        return fields;
    }, [schema]);

    const form: _Form = {
        [FORM_SYM]: 0,
        get(key: any) {
            return fields[key as string] as any;
        },
        getData() {
            return data.current;
        },
        setData(data: any) {
            setValue(ROOT_PATH, data);
        },
        resetData() {
            setValue(ROOT_PATH, getInitialValues());
        },
        submit,
        getState(state: FormStateType): any {
            return stateManager.current.getValue(state);
        },
        subscribeToState(state: FormStateType, subscriber: StateSubscriber): UnsubscribeFromState {
            stateManager.current.subscribe(state, subscriber);
            return () => stateManager.current.unsubscribe(state, subscriber);
        }
    };
    return form;
}

function mapElementToField(element: FormSchemaElement, formAccess: FormAccess, path: FieldPath): FormField {
    if (typeof element === "function") {
        return mapElementToField(element(), formAccess, path);
    }

    if (element.type === "string") {
        return new StringField(path, formAccess);
    }
    else if (element.type === "number") {
        return new NumberField(path, formAccess);
    }
    else if (element.type === "bool") {
        return new BooleanField(path, formAccess);
    }
    else if (element.type === "array") {
        return new ArrayField(path, formAccess, idx => mapElementToField(element.item, formAccess, path.withArrayIndex(idx)));
    }
    else if (element.type === "object") {
        const properties: ObjectSchema = element.properties;
        const keyToFactory: any = {};
        for (const [key, value] of Object.entries(properties)) {
            keyToFactory[key] = () => mapElementToField(value, formAccess, path.withProperty(key));
        }
        return new ObjectField(path, formAccess, keyToFactory);
    }
    throw new Error(`Unsupported element: ${element satisfies never}`);
}

export type Form<D, T extends FieldSet> = {
    get<K extends keyof T>(key: K): T[K]

    getData(): D

    setData(data: D): void

    resetData(): void

    submit(e: FormEvent): void
}

export type _Form = {
    [FORM_SYM]: 0,

    getState(state: FormStateType): any

    subscribeToState(state: FormStateType, subscriber: StateSubscriber): UnsubscribeFromState;
} & Form<any, any>;

export function isInternalForm<D, F extends FieldSet>(form: Form<D, F>): form is _Form {
    return Object.hasOwn(form, FORM_SYM);
}

const FORM_SYM = Symbol.for("FORM");

export type FormAccess = {
    subscribe(path: FieldPath, subscriber: Subscriber): Unsubscribe;

    getValue(path: FieldPath): any;

    setValue(path: FieldPath, value: any): void;
}

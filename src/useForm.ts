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
import { Subscriber, FormStateTree, Unsubscribe } from "./FormStateTree";
import { FormSchema } from "./FormSchema";
import { FormStateType, StateSubscriber, FormStateManager, UnsubscribeFromState } from "./FormStateManager";
import { Validator, ValidatorReturn } from "./validators";

// type ObjectVisitor<T extends Record<string, any>, D> = {
//     [K in keyof T]?: T[K] extends string | number | boolean ? Validator<T, D> :
//         T extends object ? ObjectVisitor<T, D> : never;
// } & {
//     __self?: Validator<T, D>;
// };

export type ArrayValidator<Value, FormValues> = (value: Value, a: { forEachElement: (validator: FieldVisitor<Value, FormValues>) => void }) => ValidatorReturn;
export type ObjValidator<Value, FormValues> = (value: Value, a: { visit: (visitor: Visitor<Value>) => void }) => ValidatorReturn;

export type FieldVisitor<T, D> =
    T extends string | number | boolean ? Validator<T, D> :
        T extends Array<infer A> ? ArrayValidator<A, D> :
            T extends object ? ObjValidator<T, D> : never;

export type Visitor<T> = {
    [K in keyof T]?: FieldVisitor<T[K], T>
}

type UseFormOpts<T extends SchemaElementSet, R> = {
    schema: FormSchema<T>
    getInitialValues(): FormData<T>
    submit(values: FormData<T>): Promise<R>

    // Optional
    onSuccess?(args: { result: R, values: FormData<T> }): void
    onError?(error: unknown): void

    validate?: Visitor<FormData<T>>
}

type FormData<T extends SchemaElementSet> = {
    [K in keyof T]: SchemaValue<T[K]>
};

export type FormForSchema<T extends FormSchema<any>> = T extends FormSchema<infer A> ? Form<FormData<A>, FieldSetFromElementSet<A>> : never;
export type FormDataForSchema<T extends FormSchema<any>> = T extends FormSchema<infer A> ? FormData<A> : never;

const ROOT_PATH = FieldPath.create();

export function useForm<T extends SchemaElementSet, R>(opts: UseFormOpts<T, R>): FormForSchema<FormSchema<T>> {
    const data = useRef(opts.getInitialValues());
    const stateTree = useRef(new FormStateTree());
    const stateManager = useRef(new FormStateManager());

    const { schema, getInitialValues, submit: submitForm, onSuccess, onError, validate } = opts;

    const getValue = useCallback((path: FieldPath) => path.getValue(data.current), []);

    const setValue = useCallback((path: FieldPath, value: any) => {
        data.current = path.getDataWithValue(data.current, value);
        stateTree.current.notifyValueChanged(path);
    }, []);

    const subscribeToValue = useCallback((path: FieldPath, subscriber: Subscriber) => {
        const unsubscribe = stateTree.current.subscribeToValue(path, subscriber);
        return () => unsubscribe();
    }, []);

    const getErrors = useCallback((path: FieldPath) => {
        return stateTree.current.getErrors(path);
    }, []);

    const subscribeToErrors = useCallback((path: FieldPath, subscriber: Subscriber) => {
        const unsubscribe = stateTree.current.subscribeToErrors(path, subscriber);
        return () => unsubscribe();
    }, []);

    const submit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        const values = data.current;
        if (validate) {
            validateObject(values, values, validate, ROOT_PATH, stateTree.current);
            if (stateTree.current.hasError()) {
                console.log("Failed to submit because of validation errors");
                return;
            }
        }

        if (stateManager.current.getValue("isSubmitting")) {
            console.log("Skipping dupe submission");
            return;
        }
        stateManager.current.setValue("isSubmitting", true);
        stateManager.current.setValue("submissionError", undefined);

        try {
            const result = await submitForm(values);
            onSuccess?.({ result, values });
        }
        catch (e) {
            stateManager.current.setValue("submissionError", e);
            onError?.(e);
        }
        stateManager.current.setValue("isSubmitting", false);
    }, [submitForm, onSuccess, onError]);

    const fields = useMemo(() => {
        const formAccess: FormAccess = {
            getValue,
            setValue,
            subscribeToValue,
            getErrors,
            subscribeToErrors,
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
            const field = fields[key as string];
            if (!field) throw new Error("No field with path: " + key);
            return field as any;
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

function validateObject<R, T extends Record<string, any>>(rootData: R, data: T, visitor: Visitor<T>, path: FieldPath, tree: FormStateTree) {
    for (const [key, value] of Object.entries(data)) {
        const keyVisitor = visitor[key];
        if (keyVisitor) {
            validateValue(value, rootData as any, keyVisitor, path.withProperty(key), tree);
        }
    }
}

function validateValue<V, R>(value: V, rootData: R, keyVisitor: FieldVisitor<V, R>, path: FieldPath, tree: FormStateTree) {
    if (Array.isArray(value)) {
        const arrVisitor = keyVisitor as ArrayValidator<typeof value, R>;
        const errors = arrVisitor(
            value,
            {
                forEachElement(validator) {
                    for (let i = 0; i < value.length; ++i) {
                        validateValue(value[i], rootData, validator, path.withArrayIndex(i), tree);
                    }
                }
            }
        );
        if (errors) {
            tree.setErrors(path, typeof errors === "string" ? [errors] : errors);
        }
    }
    else if (typeof value === "object" && value !== null) {
        const objVisitor = keyVisitor as ObjValidator<typeof value, R>;
        objVisitor(value, {
            visit(visitor) {
                validateObject(rootData, value, visitor, path, tree);
            }
        });
    }
    else {
        const primitiveVisitor = keyVisitor as Validator<typeof value, R>;
        const errors = primitiveVisitor(value, rootData);
        if (errors) {
            tree.setErrors(path, typeof errors === "string" ? [errors] : errors);
        }
    }
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
    getValue(path: FieldPath): any;
    setValue(path: FieldPath, value: any): void;
    subscribeToValue(path: FieldPath, subscriber: Subscriber): Unsubscribe;

    getErrors(path: FieldPath): string[] | undefined
    subscribeToErrors(path: FieldPath, subscriber: Subscriber): Unsubscribe;
}

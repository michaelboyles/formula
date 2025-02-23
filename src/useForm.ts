import { FormEvent, useCallback, useMemo, useRef } from "react";
import { FieldFromNative, FormFieldImpl } from "./FormField";
import { FieldPath } from "./FieldPath";
import { FormStateTree, Subscriber, Unsubscribe } from "./FormStateTree";
import { FormState, FormStateManager, FormStateType, StateSubscriber, UnsubscribeFromState } from "./FormStateManager";
import { Validator, ValidatorReturn } from "./validators";
import { getValidationIssues } from "./validate-std-schema";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { validateObject } from "./validate-native";

export type ArrayValidator<Element, FormValues> = (value: Element[], a: { forEachElement: (validator: FieldVisitor<Element, FormValues>) => void }) => ValidatorReturn;
export type ObjValidator<Value, FormValues> = (value: Value, a: { visit: (visitor: Visitor<Value>) => void }) => ValidatorReturn;

export type FieldVisitor<T, D> =
    T extends string | number | boolean ? Validator<T, D> :
        T extends Array<infer A> ? ArrayValidator<A, D> :
            T extends object ? ObjValidator<T, D> : never;

export type Visitor<T> = {
    [K in keyof T]?: FieldVisitor<T[K], T>
}

// TODO 2
type BaseForm = Record<string, any>;

type UseFormOpts<T extends BaseForm, R> = {
    getInitialValues: () => T
    submit: (values: T) => Promise<R>

    // Optional
    onSuccess?: (args: { result: R, values: T }) => void
    onError?: (error: unknown) => void

    validate?: Visitor<NoInfer<T>>
    validators?: StandardSchemaV1<Partial<T>>[]
}

const ROOT_PATH = FieldPath.create();

export function useForm<T extends BaseForm, R>(opts: UseFormOpts<T, R>): Form<T> {
    const { getInitialValues, submit: submitForm, onSuccess, onError, validate, validators } = opts;

    const data = useRef(opts.getInitialValues());
    const stateTree = useRef(new FormStateTree());
    const stateManager = useRef(new FormStateManager());

    const setValue = useCallback((path: FieldPath, value: any) => {
        data.current = path.getDataWithValue(data.current, value);
        stateTree.current.notifyValueChanged(path);
    }, []);

    const submit = useCallback(async (e?: FormEvent) => {
        e?.preventDefault();
        const values = data.current;

        stateTree.current.clearAllErrors();
        const [issues] = await Promise.all([
            getValidationIssues(values, validators ?? []),
            validate ? validateObject(values, values, validate, ROOT_PATH, stateTree.current) : Promise.resolve()
        ]);
        if (issues.length) {
            issues.forEach(issue => {
                stateTree.current.setErrors(issue.path, [issue.message]);
            });

            console.log("Failed to submit because of validation errors", JSON.stringify(issues));
            return;
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
            stateManager.current.setValue("submissionError", convertSubmissionError(e));
            onError?.(e);
        }
        stateManager.current.setValue("isSubmitting", false);
    }, [onError, onSuccess, submitForm, validators]);

    const formAccess: FormAccess = useMemo(() => ({
        getValue: path => path.getValue(data.current),
        setValue,
        updateValue: (path, update) => {
            const value = path.getValue(data.current);
            const newValue = update(value);
            setValue(path, newValue);
        },
        subscribeToValue: (path, subscriber) => {
            const unsubscribe = stateTree.current.subscribeToValue(path, subscriber);
            return () => unsubscribe();
        },
        getErrors: path => stateTree.current.getErrors(path),
        subscribeToErrors: (path, subscriber) => {
            const unsubscribe = stateTree.current.subscribeToErrors(path, subscriber);
            return () => unsubscribe();
        },
        isTouched: path => stateTree.current.isTouched(path),
        setTouched: (path, touched) => stateTree.current.setTouched(path, touched),
        subscribeToTouched: (path, subscriber) => {
            const unsubscribe = stateTree.current.subscribeToTouched(path, subscriber);
            return () => unsubscribe();
        }
    }), []);

    const form: _Form = {
        [FORM_SYM]: 0,
        get(key: any) {
            return new FormFieldImpl(ROOT_PATH.withProperty(key), formAccess);
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
        getState(state) {
            return stateManager.current.getValue(state);
        },
        subscribeToState(state: FormStateType, subscriber: StateSubscriber): UnsubscribeFromState {
            stateManager.current.subscribe(state, subscriber);
            return () => stateManager.current.unsubscribe(state, subscriber);
        }
    };
    return form;
}

export type Form<D> = {
    get: <K extends keyof D>(key: K) => FieldFromNative<D[K]>

    getData: () => D

    setData: (data: D) => void

    resetData: () => void

    submit: (e?: FormEvent) => void
}

export type _Form = {
    [FORM_SYM]: 0,

    getState: <T extends FormStateType>(state: T) => FormState[T]

    subscribeToState: (state: FormStateType, subscriber: StateSubscriber) => UnsubscribeFromState;
} & Form<any>;

export function isInternalForm(form: Form<any>): form is _Form {
    return Object.hasOwn(form, FORM_SYM);
}

const FORM_SYM = Symbol.for("FORM");

export type FormAccess = {
    getValue: (path: FieldPath) => any
    setValue: (path: FieldPath, value: any) => void
    updateValue: <T>(path: FieldPath, update: (value: T) => T) => void
    subscribeToValue: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

    getErrors: (path: FieldPath) => ReadonlyArray<string> | undefined
    subscribeToErrors: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

    isTouched: (path: FieldPath) => boolean
    setTouched: (path: FieldPath, touched: boolean) => void
    subscribeToTouched: (path: FieldPath, subscriber: Subscriber) => Unsubscribe
}

function convertSubmissionError(e: unknown) {
    if (e instanceof Error) {
        return e;
    }
    else if (typeof e === "string") {
        return new Error(e);
    }
    else {
        return new Error("Submission error", { cause: e });
    }
}
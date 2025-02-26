import { FormEvent, useCallback, useMemo, useRef } from "react";
import { FieldFromNative, FormField, FormFieldImpl } from "./FormField";
import { FieldPath } from "./FieldPath";
import { FormStateTree, Subscriber, Unsubscribe } from "./FormStateTree";
import { FormState, FormStateManager, FormStateType, StateSubscriber, UnsubscribeFromState } from "./FormStateManager";
import { getValidationIssues } from "./validate-std-schema";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { validateObject } from "./validate-native";
import { Visitor } from "./validate";

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

        if (stateManager.current.getValue("isSubmitting")) {
            console.log("Skipping dupe submission");
            return;
        }
        stateManager.current.setValue("isSubmitting", true);
        stateManager.current.setValue("submissionError", undefined);

        try {
            const values = data.current;
            stateTree.current.clearAllErrors();

            const getIssues = async () => {
                const result = await Promise.all([
                    getValidationIssues(values, validators ?? []),
                    validate ? validateObject(values, values, validate, ROOT_PATH) : Promise.resolve([])
                ]);
                return result.flatMap(a => a);
            }
            const issues = await getIssues();
            if (issues.length) {
                issues.forEach(issue => {
                    stateTree.current.appendErrors(issue.path, [issue.message]);
                });

                console.log("Failed to submit because of validation errors", JSON.stringify(issues));
                return;
            }

            try {
                const result = await submitForm(values);
                onSuccess?.({ result, values });
            }
            catch (e) {
                stateManager.current.setValue("submissionError", convertSubmissionError(e));
                onError?.(e);
            }
        }
        finally {
            stateManager.current.setValue("isSubmitting", false);
        }
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
        setErrors: (path, errors) => stateTree.current.setErrors(path, errors),
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

    return useMemo<_Form<T>>(() => {
        return {
            [FORM_SYM]: 0,
            get: key => new FormFieldImpl(ROOT_PATH.withProperty(key), formAccess) as any,
            getUnsafeField: path => {
                let fieldPath = ROOT_PATH;
                for (const part of path) {
                    if (typeof part === "string") {
                        fieldPath = fieldPath.withProperty(part);
                    }
                    else {
                        fieldPath = fieldPath.withArrayIndex(part);
                    }
                }
                return new FormFieldImpl(fieldPath, formAccess);
            },
            getData: () => data.current,
            setData: data => {
                setValue(ROOT_PATH, data);
            },
            resetData: () => {
                setValue(ROOT_PATH, getInitialValues());
            },
            submit,
            getState: state => stateManager.current.getValue(state),
            subscribeToState: (state: FormStateType, subscriber: StateSubscriber): UnsubscribeFromState => {
                stateManager.current.subscribe(state, subscriber);
                return () => stateManager.current.unsubscribe(state, subscriber);
            }
        }
    }, [submit]);
}

export type Form<D> = {
    get: <K extends keyof Omit<D, symbol>>(key: K) => FieldFromNative<D[K]>

    getUnsafeField: (path: (string | number)[]) => FormField<unknown>

    getData: () => D

    setData: (data: D) => void

    resetData: () => void

    submit: (e?: FormEvent) => void
}

export type _Form<T = unknown> = {
    [FORM_SYM]: 0,

    getState: <T extends FormStateType>(state: T) => FormState[T]

    subscribeToState: (state: FormStateType, subscriber: StateSubscriber) => UnsubscribeFromState;
} & Form<T>;

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
    setErrors: (path: FieldPath, errors: string | string[] | undefined) => void
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
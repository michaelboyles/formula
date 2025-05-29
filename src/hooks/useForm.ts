import { FormEvent, useCallback, useMemo, useRef } from "react";
import { FormField, newFormField } from "../FormField.ts";
import { FieldPath } from "../FieldPath.ts";
import { FormStateTree, Subscriber, Unsubscribe } from "../FormStateTree.ts";
import { FormState, FormStateManager, FormStateType, StateSubscriber, UnsubscribeFromState } from "../FormStateManager.ts";
import { getValidationIssues } from "../validate-std-schema.ts";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { validateRecursive } from "../validate-native.ts";
import { Issue, Validator } from "../validate.ts";

// TODO 2
type BaseForm = Record<string | number, any>;

type UseFormOpts<T extends BaseForm, R> = {
    initialValues: T | (() => T)
    submit: (values: T) => R | Promise<R>

    // Optional
    onSuccess?: (args: { result: NoInfer<R>, values: T }) => void

    // A callback invoked when there is a form submission error. When the promise returned by 'submit' is rejected, this
    // function will be invoked. If the promise wasn't rejected with an Error then it will be wrapped in one, and
    // Error.cause will be set.
    onError?: (error: Error, ctx: { form: Form<T> }) => void

    validate?: Validator<NoInfer<T>, NoInfer<T>>
    validators?: StandardSchemaV1<Partial<T>>[]

    // Whether to perform validation after a field is blurred. Default: false
    validateOnBlur?: boolean
    // Whether to perform validation after a field is changed. Default: false
    validateOnChange?: boolean
}

const ROOT_PATH = FieldPath.create();

export function useForm<T extends BaseForm, R>(opts: UseFormOpts<T, R>): Form<T> {
    const {
        initialValues,
        submit: submitForm,
        onSuccess,
        onError,
        validate,
        validators,
        validateOnBlur = false,
        validateOnChange = false,
    } = opts;

    const self = useRef<_Form<T> | null>(null);
    const data = useRef(typeof initialValues === "function" ? initialValues() : initialValues);
    const stateTree = useRef(new FormStateTree());
    const stateManager = useRef(new FormStateManager());

    const setValue = useCallback((path: FieldPath, value: any) => {
        data.current = path.getDataWithValue(data.current, value);
        stateTree.current.notifyValueChanged(path);
        if (validateOnChange) {
            validateAll(data.current);
        }
    }, [validateOnChange]);

    const validateAll = async (values: T) => {
        stateTree.current.clearAllErrors();

        const pendingValidations: Array<Promise<Issue[]>> = [];
        if (validators) {
            pendingValidations.push(getValidationIssues(values, validators));
        }
        if (validate) {
            pendingValidations.push(validateRecursive(values, values, validate, ROOT_PATH));
        }
        if (pendingValidations.length) {
            const issues = (await Promise.all(pendingValidations)).flatMap(a => a);
            issues.forEach(issue => {
                stateTree.current.appendErrors(issue.path, [issue.message]);
            });
            return issues;
        }
        return [];
    }

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
            const issues = await validateAll(values);
            if (issues.length) {
                console.log("Failed to submit because of validation errors", JSON.stringify(issues));
                return;
            }

            try {
                const result = await submitForm(values);
                onSuccess?.({ result, values });
            }
            catch (e) {
                const error = convertSubmissionError(e);
                stateManager.current.setValue("submissionError", error);
                onError?.(error, { form: self.current! });
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
        blurred: path => stateTree.current.blurred(path),
        setBlurred: (path, blurred) => {
            stateTree.current.setBlurred(path, blurred);
            if (validateOnBlur) {
                validateAll(data.current);
            }
        },
        subscribeToBlurred: (path, subscriber) => {
            const unsubscribe = stateTree.current.subscribeToBlurred(path, subscriber);
            return () => unsubscribe();
        }
    }), [setValue, validateOnBlur]);

    return useMemo(() => {
        const form = (key: keyof T) => newFormField(ROOT_PATH.withProperty(key), formAccess) as any;
        form[FORM_SYM] = 0 as const;
        form.getUnsafeField = (path: any[]) => {
            let fieldPath = ROOT_PATH;
            for (const part of path) {
                if (typeof part === "string") {
                    fieldPath = fieldPath.withProperty(part);
                }
                else {
                    fieldPath = fieldPath.withArrayIndex(part);
                }
            }
            return newFormField(fieldPath, formAccess);
        };
        form.getData = () => data.current;
        form.setData = (data: T) => setValue(ROOT_PATH, data);
        form.reset = () => {
            const newValues = typeof initialValues === "function" ? initialValues() : initialValues;
            setValue(ROOT_PATH, newValues);
        };
        form.submit = submit;
        form.getState = <T extends FormStateType>(state: T) => stateManager.current.getValue(state);
        form.subscribeToState = (state: FormStateType, subscriber: StateSubscriber): UnsubscribeFromState => {
            stateManager.current.subscribe(state, subscriber);
            return () => stateManager.current.unsubscribe(state, subscriber);
        }
        self.current = form satisfies _Form<T>;
        return form;
    }, [initialValues, submit]);
}

export type Form<Data> = (<K extends keyof Omit<Data, symbol>>(key: K) => FormField<Data[K]>) & {
    // Submits the form. You will likely wire this to `<form onSubmit={form.submit}>`, but there may be cases
    // where you call it programmatically.
    submit: (e?: FormEvent) => void

    // Get a field, ignoring type-safety. Generally you should use 'get' instead.
    getUnsafeField: (path: (string | number)[]) => FormField<unknown>

    // Get the current form data
    getData: () => Data

    // Set the current form data
    setData: (data: Data) => void

    // Discards the current form state and sets the value using `initialValues`
    reset: () => void
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

    getErrors: (path: FieldPath) => ReadonlyArray<string>
    setErrors: (path: FieldPath, errors: string | string[] | undefined) => void
    subscribeToErrors: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

    blurred: (path: FieldPath) => boolean
    setBlurred: (path: FieldPath, blurred: boolean) => void
    subscribeToBlurred: (path: FieldPath, subscriber: Subscriber) => Unsubscribe
}

function convertSubmissionError(e: unknown) {
    if (e instanceof Error) {
        return e;
    }
    else if (typeof e === "string") {
        return new Error(e, { cause: e });
    }
    else {
        return new Error("Submission error", { cause: e });
    }
}

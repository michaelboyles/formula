import { type FormEvent, useEffect, useMemo, useRef } from "react";
import { type FormField, newFormField } from "../FormField.ts";
import { FieldPath } from "../FieldPath.ts";
import { FormStateTree, type Subscriber, type Unsubscribe } from "../FormStateTree.ts";
import {
    type FormState,
    FormStateManager,
    type FormStateType,
    type StateSubscriber,
    type UnsubscribeFromState
} from "../FormStateManager.ts";
import { getValidationIssues } from "../validate-std-schema.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { validateRecursive } from "../validate-native.ts";
import type { Issue, Validator } from "../validate.ts";
import { useLazyRef } from "./useLazyRef.ts";
import { ValidationError } from "../ValidationError.ts";

type UseFormOpts<Data, SubmitResponse> = {
    // The initial values for the form. This is the only required option.
    initialValues: Data | (() => Data)

    // A function invoked when the form is submitted. This can be omitted if you want to use native form submission
    submit?: (data: Data) => SubmitResponse | Promise<SubmitResponse>

    // A callback invoked when the form was successfully submitted
    // `result`: the value returned from `submit`
    // `data`: the form data that was submitted
    // `form`: a reference to the Formula form instance
    onSubmitSuccess?: (args: { result: NoInfer<SubmitResponse>, data: Data, form: Form<Data> }) => void

    // A callback invoked when submitting the form fails.
    // `error`: The error that was thrown. If submission failed because of validation issues, this will be a
    //          ValidationError. If a non-Error was thrown, then it will be wrapped in one, and Error.cause will be set.
    // `data`: the form data that was submitted
    // `form`: a reference to the Formula form instance
    onSubmitFailure?: (args: { error: Error, data: Data, form: Form<Data> }) => void

    // A Formula native validator
    validate?: Validator<NoInfer<Data>, NoInfer<Data>>

    // A list of Standard Schema validators (e.g. Zod)
    validators?: ReadonlyArray<StandardSchemaV1<Partial<Data>>>

    // Whether to perform validation after a field is blurred. Default: false
    validateOnBlur?: boolean

    // Whether to perform validation after a field is changed. Default: false
    validateOnChange?: boolean
}

const ROOT_PATH = FieldPath.create();

export function useForm<Data, SubmitResponse>(opts: UseFormOpts<Data, SubmitResponse>): Form<Data> {
    const activeOpts = useRef(opts);
    useEffect(() => {
        activeOpts.current = opts;
    });

    const self = useRef<FormWithInternals<Data> | null>(null);
    const data = useLazyRef(opts.initialValues);
    const stateTree = useRef(new FormStateTree());
    const stateManager = useRef(new FormStateManager());

    function setValue(path: FieldPath, value: any) {
        data.current = path.getDataWithValue(data.current, value);
        stateTree.current.notifyValueChanged(path, data.current);
        if (activeOpts.current.validateOnChange) {
            validateAll(data.current);
        }
    }

    const validateAll = async (values: Data) => {
        stateTree.current.clearAllErrors();

        const pendingValidations: Array<Promise<Issue[]>> = [];
        const validators = activeOpts.current.validators;
        if (validators) {
            pendingValidations.push(getValidationIssues(values, validators));
        }
        const validate = activeOpts.current.validate;
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

    async function submit(e?: FormEvent) {
        e?.preventDefault();

        if (stateManager.current.getValue("isSubmitting")) {
            console.log("Skipping dupe submission");
            return;
        }
        stateManager.current.setValue("isSubmitting", true);
        stateManager.current.setValue("submissionError", undefined);

        try {
            const submitData = data.current;
            const issues = await validateAll(submitData);
            if (issues.length) {
                const error = new ValidationError(issues);
                stateManager.current.setValue("submissionError", error);
                activeOpts.current.onSubmitFailure?.({ error, data: submitData, form: self.current! });
                return;
            }

            const submitForm = activeOpts.current.submit;
            if (submitForm) {
                try {
                    const result = await submitForm(submitData);
                    activeOpts.current.onSubmitSuccess?.({ result, data: submitData, form: self.current! });
                }
                catch (e) {
                    const error = convertSubmissionError(e);
                    stateManager.current.setValue("submissionError", error);
                    activeOpts.current.onSubmitFailure?.({ error, data: submitData, form: self.current! });
                }
            }
            else if (e) {
                if ("submit" in e.target && typeof e.target.submit === "function") {
                    e.target.submit();
                }
                else {
                    console.error("Can't submit form with event:", e);
                }
            }
            else {
                throw new Error(
                    "Form is not submittable. You must either provide a 'submit' option to useForm, or " +
                    "pass an event to form.submit"
                );
            }
        }
        finally {
            stateManager.current.setValue("isSubmitting", false);
        }
    }

    const formAccess: FormAccess = {
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

        getDeepErrors: path => stateTree.current.getDeepErrors(path),
        subscribeToDeepErrors: (path, subscriber) => {
            const unsubscribe = stateTree.current.subscribeToDeepErrors(path, subscriber);
            return () => unsubscribe();
        },

        blurred: path => stateTree.current.blurred(path),
        setBlurred: (path, blurred) => {
            stateTree.current.setBlurred(path, blurred);
            if (activeOpts.current.validateOnBlur) {
                validateAll(data.current);
            }
        },
        subscribeToBlurred: (path, subscriber) => {
            const unsubscribe = stateTree.current.subscribeToBlurred(path, subscriber);
            return () => unsubscribe();
        }
    };

    return useMemo(() => {
        const form = Object.assign(newFormField<Data>(ROOT_PATH, formAccess), {
            getUnsafeField: (path: any[]) => {
                let fieldPath = ROOT_PATH;
                for (const part of path) {
                    fieldPath = fieldPath.withProperty(part);
                }
                return newFormField(fieldPath, formAccess);
            },
            getData: () => data.current,
            setData: (data: Data) => setValue(ROOT_PATH, data),
            reset: () => {
                const initialValues = activeOpts.current.initialValues;
                const newValues = typeof initialValues === "function" ? (initialValues as () => Data)() : initialValues;
                setValue(ROOT_PATH, newValues);
            },
            submit,
            __internal: {
                [FORM_SYM]: 0 as const,
                getState: <T extends FormStateType>(state: T) => stateManager.current.getValue(state),
                subscribeToState: (state: FormStateType, subscriber: StateSubscriber): UnsubscribeFromState => {
                    stateManager.current.subscribe(state, subscriber);
                    return () => stateManager.current.unsubscribe(state, subscriber);
                },
            }
        });
        self.current = form satisfies FormWithInternals<Data>;
        return form;
    }, []);
}

export type Form<Data> = FormField<Data> & {
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

export type FormWithInternals<Data = unknown> = Form<Data> & {
    __internal: {
        [FORM_SYM]: 0

        getState: <T extends FormStateType>(state: T) => FormState[T]

        subscribeToState: (state: FormStateType, subscriber: StateSubscriber) => UnsubscribeFromState
    }
}

export function isInternalForm(form: any): form is FormWithInternals {
    return typeof form === "function"
        && Object.hasOwn(form, "__internal")
        && typeof form.__internal === "object"
        && Object.hasOwn(form.__internal, FORM_SYM);
}

const FORM_SYM = Symbol("FORMULA_FORM");

export type FormAccess = {
    getValue: (path: FieldPath) => any
    setValue: (path: FieldPath, value: any) => void
    updateValue: <T>(path: FieldPath, update: (value: T) => T) => void
    subscribeToValue: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

    getErrors: (path: FieldPath) => ReadonlyArray<string>
    setErrors: (path: FieldPath, errors: string | string[] | undefined) => void
    subscribeToErrors: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

    getDeepErrors: (path: FieldPath) => ReadonlyArray<string>
    subscribeToDeepErrors: (path: FieldPath, subscriber: Subscriber) => Unsubscribe

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

import { type FormEvent, useMemo, useRef } from "react";
import { type FormField, type Listener, newFormField } from "../FormField.ts";
import { FieldPath } from "../FieldPath.ts";
import { FieldStateTree, type Unsubscribe } from "../FieldStateTree.ts";
import {
    type FormState,
    FormStateManager,
    type FormStateType,
    type StateSubscriber,
    type UnsubscribeFromState
} from "../FormStateManager.ts";
import { validateStandardSchema } from "../validate-std-schema.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { validateNative } from "../validate-native.ts";
import type { Validator } from "../validate.ts";
import { useLazyRef } from "./useLazyRef.ts";
import { ValidationError } from "../ValidationError.ts";
import type { FormSubmitResult, SetDataOpts, Setter } from "../types.ts";
import { useHistory } from "./useHistory.ts";

type UseFormOpts<Data, SubmitResponse> = {
    /** The initial values for the form. This is the only required option. */
    initialValues: Data | (() => Data)

    /**
     * A function invoked when the form is submitted. This can be omitted if you want to
     * use native form submission
     */
    submit?: (data: Data) => SubmitResponse | Promise<SubmitResponse>

    /** A callback invoked when the form was successfully submitted */
    onSubmitSuccess?: (args: {
        /** The value returned from `submit` */
        result: NoInfer<SubmitResponse>
        /** The form data that was submitted */
        data: Data
        /** The same form instance returned by `useForm` */
        form: Form<Data>
    }) => void

    /** A callback invoked when submitting the form fails */
    onSubmitFailure?: (args: {
        /**
         * The error that was thrown. If submission failed because of validation
         * issues, this will be a ValidationError. If a non-Error was thrown,
         * then it will be wrapped in one, and Error#cause will be set.
         */
        error: Error
        /** The form data that was submitted */
        data: Data
        /** The same form instance returned by `useForm` */
        form: Form<Data>
    }) => void

    /** A Formula native validator */
    validate?: Validator<NoInfer<Data>, NoInfer<Data>>

    /** A list of Standard Schema validators (e.g. Zod) */
    validators?: ReadonlyArray<StandardSchemaV1<Partial<Data>>>

    /**
     * Whether to perform validation after a field is blurred
     * @default false
     */
    validateOnBlur?: boolean

    /**
     * Whether to perform validation after a field is changed
     * @default false
     */
    validateOnChange?: boolean

    /** Undo/redo options */
    history?: {
        /**
         * The max number of changes to store in the undo history
         * @default 0 (no history)
         */
        maxSize?: number
    }
}

const ROOT_PATH = FieldPath.create();

export function useForm<Data, SubmitResponse>(opts: UseFormOpts<Data, SubmitResponse>): Form<Data> {
    const activeOpts = useRef(opts);
    activeOpts.current = opts;

    const self = useRef<FormWithInternals<Data> | null>(null);
    const data = useLazyRef(opts.initialValues);
    const fieldState = useRef(new FieldStateTree());
    const stateManager = useRef(new FormStateManager());

    const validateAll = async (data: Data) => {
        fieldState.current.clearAllErrors();

        const pendingValidations: Array<Promise<StandardSchemaV1.Issue[]>> = [];
        const validators = activeOpts.current.validators;
        if (validators) {
            pendingValidations.push(validateStandardSchema(data, validators));
        }
        const validate = activeOpts.current.validate;
        if (validate) {
            pendingValidations.push(validateNative(data, data, validate, ROOT_PATH));
        }
        if (pendingValidations.length) {
            const issues = (await Promise.all(pendingValidations)).flatMap(a => a);
            issues.forEach(issue => {
                if (issue.path) {
                    fieldState.current.appendErrors(FieldPath.fromStdSchema(issue.path), [issue.message]);
                }
            });
            return issues;
        }
        return [];
    }

    async function submit(e?: FormEvent): Promise<FormSubmitResult> {
        e?.preventDefault();

        if (stateManager.current.getValue("isSubmitting")) {
            return { type: "already-submitting" };
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
                return { type: "validation-error", error };
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
                    "Form is not submittable. You must either declare a 'submit' function in useForm, or " +
                    "provide a FormEvent when you call 'submit()'"
                );
            }
        }
        finally {
            stateManager.current.setValue("isSubmitting", false);
        }
        return { type: "success" }
    }

    const { canUndo, canRedo, undo, redo, push: pushHistory } = useHistory({
        maxSize: opts.history?.maxSize ?? 0,
        setData: (path, value) => {
            data.current = path.getDataWithValue(data.current, value);
            fieldState.current.notifyDataChanged(path, data.current);
        }
    });

    const formAccess: FormAccess = {
        getData: path => path.getData(data.current),
        setData: (path, setter, opts) => {
            const prevData = path.getData(data.current);
            if (typeof setter === "function") {
                const newData = setter(prevData);
                data.current = path.getDataWithValue(data.current, newData);
                pushHistory({ path, prevValue: prevData, newValue: newData });
            }
            else {
                data.current = path.getDataWithValue(data.current, setter);
                pushHistory({ path, prevValue: prevData, newValue: setter });
            }
            fieldState.current.notifyDataChanged(path, data.current);
            if (opts?.nextChangeStatus !== "retain") {
                fieldState.current.setIsChanged(path, opts?.nextChangeStatus ?? true);
            }
            if (opts?.shouldValidate || (activeOpts.current.validateOnChange && opts?.shouldValidate !== false)) {
                validateAll(data.current);
            }
        },
        addDataListener: (path, listener) => fieldState.current.addDataListener(path, listener),

        getErrors: path => fieldState.current.getErrors(path),
        setErrors: (path, errors) => fieldState.current.setErrors(path, errors),
        addErrorListener: (path, listener) => fieldState.current.addErrorListener(path, listener),

        getDeepErrors: path => fieldState.current.getDeepErrors(path),
        addDeepErrorsListener: (path, listener) => fieldState.current.addDeepErrorsListener(path, listener),

        isBlurred: path => fieldState.current.blurred(path),
        setIsBlurred: (path, blurred) => {
            fieldState.current.setBlurred(path, blurred);
            if (activeOpts.current.validateOnBlur) {
                validateAll(data.current);
            }
        },
        addBlurListener: (path, subscriber) => {
            const unsubscribe = fieldState.current.addBlurListener(path, subscriber);
            return () => unsubscribe();
        },

        isChanged: path => fieldState.current.isChanged(path),
        setIsChanged: (path, isChanged) => fieldState.current.setIsChanged(path, isChanged),
        addIsChangedListener: (path, subscriber) => fieldState.current.addIsChangedListener(path, subscriber),
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
            reset: () => {
                const initialValues = activeOpts.current.initialValues;
                const newData = typeof initialValues === "function" ? (initialValues as () => Data)() : initialValues;
                const oldData = data.current;
                data.current = newData;
                fieldState.current.resetData(oldData, newData);
            },
            submit,
            validate: () => validateAll(data.current).then(issues => issues.length < 1),
            history: {
                canUndo,
                canRedo,
                undo,
                redo,
            },
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
    }, [canUndo, canRedo, undo, redo]);
}

export type Form<Data> = FormField<Data> & {
    /**
     * Submits the form. You will likely wire this to `<form onSubmit={form.submit}>`,
     * but there may be cases where you call it programmatically.
     *
     * If an event is provided, `preventDefault` will be called on it.
     *
     * The returned promise can be used to know whether submission succeeded when
     * you submit programmatically, and can be safely ignored otherwise.
     */
    submit: (e?: FormEvent) => Promise<FormSubmitResult>

    /** Get a field, ignoring type-safety. Generally you should use 'get' instead */
    getUnsafeField: (path: (string | number)[]) => FormField<unknown>

    /** Discards the current form state and sets the value using `initialValues` */
    reset: () => void

    /**
      * Performs validation of the current form data. Returns a promise indicating
      * whether the data was valid
      */
    validate: () => Promise<boolean>

    /** Undo/redo state and functions */
    history: {
        canUndo: boolean
        undo: () => void
        canRedo: boolean
        redo: () => void
    }
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
    getData: (path: FieldPath) => unknown
    setData: (path: FieldPath, setter: Setter<unknown>, opts?: SetDataOpts) => void
    addDataListener: (path: FieldPath, listener: Listener<unknown>) => Unsubscribe

    getErrors: (path: FieldPath) => ReadonlyArray<StandardSchemaV1.Issue>
    setErrors: (path: FieldPath, errors: ReadonlyArray<string | StandardSchemaV1.Issue>) => void
    addErrorListener: (path: FieldPath, listener: Listener<ReadonlyArray<StandardSchemaV1.Issue>>) => Unsubscribe

    getDeepErrors: (path: FieldPath) => ReadonlyArray<StandardSchemaV1.Issue>
    addDeepErrorsListener: (path: FieldPath, listener: Listener<ReadonlyArray<StandardSchemaV1.Issue>>) => Unsubscribe

    isBlurred: (path: FieldPath) => boolean
    setIsBlurred: (path: FieldPath, blurred: boolean) => void
    addBlurListener: (path: FieldPath, listener: Listener<boolean>) => Unsubscribe

    isChanged: (path: FieldPath) => boolean
    setIsChanged: (path: FieldPath, isChanged: boolean) => void
    addIsChangedListener: (path: FieldPath, listener: Listener<boolean>) => Unsubscribe
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

import { FormAccess } from "./useForm";
import { FieldPath } from "./FieldPath";
import { Subscriber, Unsubscribe } from "./FormStateTree";

export class FormFieldImpl<Value = any> implements FormField<Value> {
    protected readonly path: FieldPath
    protected readonly form: FormAccess

    constructor(path: FieldPath, formAccess: FormAccess) {
        this.path = path;
        this.form = formAccess;
    }

    getValue(): Value {
        return this.form.getValue(this.path);
    }

    setValue(value: Value) {
        return this.form.setValue(this.path, value);
    }

    subscribeToValue(subscriber: Subscriber): Unsubscribe {
        return this.form.subscribeToValue(this.path, subscriber);
    }

    getErrors() {
        return this.form.getErrors(this.path);
    }

    subscribeToErrors(subscriber: Subscriber): Unsubscribe {
        return this.form.subscribeToErrors(this.path, subscriber);
    }

    property(key: string) {
        return new FormFieldImpl(this.path.withProperty(key), this.form);
    }

    element(idx: number) {
        return new FormFieldImpl(this.path.withArrayIndex(idx), this.form);
    }
}

export type FormField<Value = any> = {
    getValue(): Value
    setValue(value: Value): void
    subscribeToValue(subscriber: Subscriber): Unsubscribe
    getErrors(): string[] | undefined
    subscribeToErrors(subscriber: Subscriber): Unsubscribe
}

export type ObjectField<T extends Record<any, any>> = FormField<T> & {
    property<K extends keyof T>(key: K): FieldFromNative<T[K]>;
}
export type ArrayField<E> = FormField<E[]> & {
    element(idx: number): MaybeField<E>
}

type MaybeField<T> =
    T extends Array<infer ArrayElement> ? MaybeArrayField<ArrayElement> :
        T extends Record<any, any> ? MaybeObjectField<T>
            : FormField<T | undefined>

type MaybeObjectField<T extends Record<any, any>> = {
    property<K extends keyof T>(key: K): MaybeField<T[K]>;
} & FormField<T | undefined>;

type MaybeArrayField<T> = {
    element(idx: number): MaybeField<T>;
} & FormField<T | undefined>;

export type FieldFromNative<T> =
    undefined extends T ? MaybeField<NonNullable<T>> :
        [T] extends [Array<infer Arr>] ? ArrayField<Arr> :
            [T] extends [Record<any, any>] ? ObjectField<T> :
                FormField<T>;

import type { FormAccess } from "./useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FormStateTree.ts";

export class FormFieldImpl<Value>
    implements BaseField<Value>,
        Pick<ObjectMethods<Record<string, any>>, "property">,
        Pick<ArrayMethods<any>, "element" | "push" | "remove">
{
    protected readonly path: FieldPath
    protected readonly form: FormAccess

    constructor(path: FieldPath, formAccess: FormAccess) {
        this.path = path;
        this.form = formAccess;
    }

    getValue(): Readonly<Value> {
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

    setErrors(errors: string | string[] | undefined) {
        this.form.setErrors(this.path, errors);
    }

    subscribeToErrors(subscriber: Subscriber): Unsubscribe {
        return this.form.subscribeToErrors(this.path, subscriber);
    }

    isTouched(): boolean {
        return this.form.isTouched(this.path);
    }

    setTouched(touched: boolean): void {
        return this.form.setTouched(this.path, touched);
    }

    subscribeToTouched(subscriber: Subscriber): Unsubscribe {
        return this.form.subscribeToTouched(this.path, subscriber);
    }

    property(key: string | number) {
        return new FormFieldImpl(this.path.withProperty(key), this.form);
    }


    // Array

    element(idx: number) {
        return new FormFieldImpl(this.path.withArrayIndex(idx), this.form);
    }

    push(...element: any) {
        this.form.updateValue<unknown[]>(this.path, value => {
            const copy = [...value];
            copy.push(...element);
            return copy;
        });
    }

    remove(index: number) {
        this.form.updateValue<unknown[]>(this.path, value => {
            if (index < value.length) {
                return [...value.slice(0, index), ...value.slice(index + 1)]
            }
            else {
                throw new Error(`Cannot remove element ${index} from array with length ${value.length}`);
            }
        })
    }
}

type BaseField<Value, SetValue = Value> = {
    getValue: () => Readonly<Value>
    setValue: (value: SetValue) => void
    subscribeToValue: (subscriber: Subscriber) => Unsubscribe

    getErrors: () => ReadonlyArray<string> | undefined
    setErrors: (errors: string | string[] | undefined) => void
    subscribeToErrors: (subscriber: Subscriber) => Unsubscribe

    isTouched: () => boolean
    setTouched: (touched: boolean) => void
    subscribeToTouched: (subscriber: Subscriber) => Unsubscribe
}

type ObjectMethods<T extends object> = {
    property: <K extends keyof T>(key: K) => FormField<T[K]>
}

type ArrayMethods<E> = {
    element: (idx: number) => FormField<E | undefined, E>
    push: (...items: E[]) => void
    remove: (index: number) => void
}

export type FormField<T, SetValue = T> =
    BaseField<T, SetValue> &
    (T extends ReadonlyArray<infer E> ? ArrayMethods<E>
        : T extends object ? ObjectMethods<T> : {});

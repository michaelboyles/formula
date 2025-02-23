import { FormAccess } from "./useForm";
import { FieldPath } from "./FieldPath";
import { Subscriber, Unsubscribe } from "./FormStateTree";

export class FormFieldImpl<Value, SetValue>
    implements FormField<Value, SetValue>,
        Pick<ObjectField<Record<string, any>>, "property">,
        Pick<ArrayField<any>, "element" | "push">,
        Pick<MaybeArrayField<any>, "element">,
        Pick<MaybeObjectField<Record<string, any>>, "property">
{
    protected readonly path: FieldPath
    protected readonly form: FormAccess

    constructor(path: FieldPath, formAccess: FormAccess) {
        this.path = path;
        this.form = formAccess;
    }

    getValue(): Value {
        return this.form.getValue(this.path);
    }

    setValue(value: SetValue) {
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

    isTouched(): boolean {
        return this.form.isTouched(this.path);
    }

    setTouched(touched: boolean): void {
        return this.form.setTouched(this.path, touched);
    }

    subscribeToTouched(subscriber: Subscriber): Unsubscribe {
        return this.form.subscribeToTouched(this.path, subscriber);
    }

    property(key: string) {
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

export type FormField<Value = any, SetValue = Value> = {
    getValue: () => Value
    setValue: (value: SetValue) => void
    subscribeToValue: (subscriber: Subscriber) => Unsubscribe

    getErrors: () => ReadonlyArray<string> | undefined
    subscribeToErrors: (subscriber: Subscriber) => Unsubscribe

    isTouched: () => boolean
    setTouched: (touched: boolean) => void
    subscribeToTouched: (subscriber: Subscriber) => Unsubscribe
}

export type ObjectField<T extends Record<any, any>> = FormField<T> & {
    property: <K extends keyof T>(key: K) => FieldFromNative<T[K]>
}
export type ArrayField<E> = FormField<E[]> & {
    element: (idx: number) => MaybeField<E>

    push: (...item: E[]) => void

    remove: (index: number) => void
}

type MaybeField<T> =
    T extends Array<infer ArrayElement> ? MaybeArrayField<ArrayElement> :
        T extends Record<any, any> ? MaybeObjectField<T>
            : FormField<T | undefined, T>

type MaybeObjectField<T extends Record<any, any>> = {
    property: <K extends keyof T>(key: K) => MaybeField<T[K]>
} & FormField<T | undefined, T>;

type MaybeArrayField<T> = {
    element: (idx: number) => MaybeField<T>
} & FormField<T | undefined, T>;

export type FieldFromNative<T> =
    [T] extends [undefined] ? MaybeField<NonNullable<T>> :
        [T] extends [true] ? FormField<true> :
            [T] extends [false] ? FormField<false> :
                [T] extends [boolean] ? FormField<boolean> :
                    [T] extends [Array<infer Arr>] ? ArrayField<Arr> :
                        [T] extends [Record<any, any>] ? ObjectField<T> :
                            [T] extends [unknown] ? FormField<T> : never;

import { Form, Subscriber } from "./useForm";
import { ArrayElement, NumberElement, ObjectElement, StringElement } from "./FormSchemaElement";

export class StringField {
    path: string
    form: Form<any>

    constructor(path: string) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): string {
        return this.form.getValue(this.path);
    }

    setValue(value: string) {
        return this.form.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form.subscribe(this.path, subscriber);
    }
}
export class NumberField {
    path: string
    form: Form<any>

    constructor(path: string) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): number {
        return this.form.getValue(this.path);
    }

    setValue(value: string) {
        return this.form.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form.subscribe(this.path, subscriber);
    }
}
export class ObjectField<T> {
    setForm(form: Form<any>) {
    }

    getValue(): T {
        return {} as any;
    }

    setValue(value: T) {
    }

    subscribe(subscriber: Subscriber) {
    }
}
export class ArrayField<E> {
    setForm(form: Form<any>) {
    }

    getValue(): E[] {
        return [];
    }

    setValue(value: E[]) {
    }

    subscribe(subscriber: Subscriber) {
    }
}
export type FormField = StringField | NumberField | ObjectField<any> | ArrayField<any>;

export type FieldFromElem<T> = {
    [K in keyof T]:
    T[K] extends StringElement ? StringField :
        T[K] extends NumberElement ? NumberField :
            T[K] extends ObjectElement<infer O> ? ObjectField<O> :
                T[K] extends ArrayElement<infer A> ? ArrayField<A> : never
}

import { Form, Subscriber } from "./useForm";
import { ArrayElement, NumberElement, ObjectElement, StringElement } from "./FormSchemaElement";

export class StringField {
    path: string
    form: Form<any> | undefined

    constructor(path: string) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): string {
        return this.form!.getValue(this.path);
    }

    setValue(value: string) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
    }
}
export class NumberField {
    path: string
    form: Form<any> | undefined

    constructor(path: string) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): number {
        return this.form!.getValue(this.path);
    }

    setValue(value: string) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
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
        return () => {};
    }
}
export class ArrayField<E> {
    path: string
    form: Form<any> | undefined

    constructor(path: string) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): E[] {
        return this.form!.getValue(this.path);
    }

    setValue(value: E[]) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
    }
}
export type FormField = StringField | NumberField | ObjectField<any> | ArrayField<any>;

export type FieldSetFromElementSet<T> = {
    [K in keyof T]: FieldFromElement<T[K]>
}

export type FieldFromElement<T> = T extends StringElement ? StringField :
    T extends NumberElement ? NumberField :
        T extends ObjectElement<infer O> ? ObjectField<O> :
            T extends ArrayElement<infer A> ? ArrayField<A> : never;
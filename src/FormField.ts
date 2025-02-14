import { Form } from "./useForm";
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
}
export class ObjectField<T> {
    setForm(form: Form<any>) {
    }
}
export class ArrayField<E> {
    setForm(form: Form<any>) {
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

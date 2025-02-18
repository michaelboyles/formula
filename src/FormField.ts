import { FormAccess } from "./useForm";
import {
    ArrayElement,
    FormSchemaElement,
    NumberElement,
    ObjectElement,
    ObjectSchema,
    SchemaElementSet,
    SchemaValue,
    SchemaValueForObject,
    StringElement
} from "./FormSchemaElement";
import { FieldPath } from "./FieldPath";
import { Subscriber, Unsubscribe } from "./FormStateTree";

export class FormField<Value = any> {
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
}

export class StringField extends FormField<string> {
    constructor(path: FieldPath, formAccess: FormAccess) {
        super(path, formAccess);
    }
}
export class NumberField extends FormField<number> {
    constructor(path: FieldPath, formAccess: FormAccess) {
        super(path, formAccess);
    }
}
export class BooleanField extends FormField<boolean> {
    constructor(path: FieldPath, formAccess: FormAccess) {
        super(path, formAccess);
    }
}

type ObjectPropertyFactories<T extends ObjectSchema> = { [K in keyof T]: () => FieldFromElement<T[K]> };
export class ObjectField<T extends ObjectSchema> extends FormField<SchemaValueForObject<T>>{
    private readonly keyToFactory: ObjectPropertyFactories<T>

    constructor(path: FieldPath, formAccess: FormAccess, keyToFactory: ObjectPropertyFactories<T>) {
        super(path, formAccess);
        this.keyToFactory = keyToFactory;
    }

    property<K extends keyof T>(key: K): FieldFromElement<T[K]> {
        const factory = this.keyToFactory[key];
        if (!factory) {
            const attemptedPath = this.path.withProperty(key as string);
            throw new Error("No such key " + attemptedPath.toString());
        }
        return factory()
    }
}

type ArrayElemFactory<E> = (idx: number) => E;
export class ArrayField<E extends FormSchemaElement> extends FormField<SchemaValue<E>[]> {
    private readonly elementFactory: ArrayElemFactory<FieldFromElement<E>>

    constructor(path: FieldPath, formAccess: FormAccess, elementFactory: ArrayElemFactory<FieldFromElement<E>>) {
        super(path, formAccess);
        this.elementFactory = elementFactory;
    }

    element(idx: number): FieldFromElement<E> {
        return this.elementFactory(idx);
    }
}

export type FieldSet = Record<string, FormField>;

export type FieldSetFromElementSet<T extends SchemaElementSet> = {
    [K in keyof T]: FieldFromElement<T[K]>
}

export type FieldFromElement<T extends FormSchemaElement> =
    T extends () => infer Lazy ? (Lazy extends FormSchemaElement ? FieldFromElement<Lazy> : never) :
        T extends StringElement ? StringField :
            T extends NumberElement ? NumberField :
                T extends ObjectElement<infer Obj> ? ObjectField<Obj> :
                    T extends ArrayElement<infer Arr> ? ArrayField<Arr> : never;
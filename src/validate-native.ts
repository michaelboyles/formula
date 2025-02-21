import { FieldPath } from "./FieldPath";
import { FormStateTree } from "./FormStateTree";
import { Validator } from "./validators";
import { ArrayValidator, FieldVisitor, ObjValidator, Visitor } from "./useForm";

export function validateObject<R, T extends Record<string, any>>(rootData: R, data: T, visitor: Visitor<T>, path: FieldPath, tree: FormStateTree) {
    for (const [key, value] of Object.entries(data)) {
        const keyVisitor = visitor[key];
        if (keyVisitor) {
            validateValue(value, rootData as any, keyVisitor, path.withProperty(key), tree);
        }
    }
}

function validateValue<V, R>(value: V, rootData: R, keyVisitor: FieldVisitor<V, R>, path: FieldPath, tree: FormStateTree) {
    if (Array.isArray(value)) {
        const arrVisitor = keyVisitor as ArrayValidator<typeof value, R>;
        const errors = arrVisitor(
            value,
            {
                forEachElement(validator) {
                    for (let i = 0; i < value.length; ++i) {
                        validateValue(value[i], rootData, validator, path.withArrayIndex(i), tree);
                    }
                }
            }
        );
        if (errors) {
            tree.setErrors(path, typeof errors === "string" ? [errors] : errors);
        }
    }
    else if (typeof value === "object" && value !== null) {
        const objVisitor = keyVisitor as ObjValidator<typeof value, R>;
        objVisitor(value, {
            visit(visitor) {
                validateObject(rootData, value, visitor, path, tree);
            }
        });
    }
    else {
        const primitiveVisitor = keyVisitor as Validator<typeof value, R>;
        const errors = primitiveVisitor(value, rootData);
        if (errors) {
            tree.setErrors(path, typeof errors === "string" ? [errors] : errors);
        }
    }
}
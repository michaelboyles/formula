import type { FormField } from "../FormField.ts";
import { it as vitest_it } from "@vitest/runner";
import { renderHook } from "@testing-library/react";
import { useForm } from "../hooks/useForm.ts";
import { describe, expectTypeOf } from "vitest";

describe("FormField", () => {
    it<{ prop: string }>("can access a string property of an object", field => {
        expectTypeOf(field("prop")).toEqualTypeOf<FormField<string, string>>();
    })

    it<{ prop: number }>("can access a number property of an object", field => {
        expectTypeOf(field("prop")).toEqualTypeOf<FormField<number, number>>();
    })

    it<{ prop: string[] }>("can access an array and elements", field => {
        expectTypeOf(field("prop")).toEqualTypeOf<FormField<string[], string[]>>();
        expectTypeOf(field("prop")(0)).toEqualTypeOf<FormField<string | undefined, string>>();
    })

    it<{ prop: string }>("does not compile for unknown properties", field => {
        // @ts-expect-error
        field("not-present");
    })

    it<{ prop?: string }>("supports optional properties", field => {
        expectTypeOf(field("prop")).toEqualTypeOf<FormField<string | undefined, string | undefined>>();
    })

    describe("polymorphism", () => {
        it<{ type: "foo" } | { type: "bar" }>("can read and set the only property in a union", field => {
            // You can read and set the type, since nothing depends on it
            expectTypeOf(field("type")).toEqualTypeOf<FormField<"foo" | "bar", "foo" | "bar">>();
        })

        it<{ a: string } | { b: string }>("cannot access key not present in all union members", field => {
            // @ts-expect-error
            field("a");
            // @ts-expect-error
            field("b");
        })

        type SameValuesExceptDiscriminant = { type: "foo", status: string } | { type: "bar", status: string };
        it<SameValuesExceptDiscriminant>("can read and set discriminant, when other props are equal", field => {
            // You can read the type and can set it, since setting cannot break invariants
            expectTypeOf(field("type")).toEqualTypeOf<FormField<"foo" | "bar", "foo" | "bar">>();
            // Same with status
            expectTypeOf(field("status")).toEqualTypeOf<FormField<string, string>>();
        })

        type SameKeysDifferentValues = { type: "on-state", state: "on" } | { type: "off-state", state: "off" };
        it<SameKeysDifferentValues>("can read but not set a discriminant, even when the keys match", field => {
            expectTypeOf(field("type")).toEqualTypeOf<FormField<"on-state" | "off-state", never>>();
        })

        it<{ type: "x", value: 1 } | { type: "x", value: 2 }>("can set common properties (non-discriminant)", field => {
            // You can read the value and can set it, since setting cannot break invariants
            expectTypeOf(field("value")).toEqualTypeOf<FormField<1 | 2, 1 | 2>>();
        })

        type Nested =
            | { type: "a", nested: { n: 1 } }
            | { type: "b", nested: { n: 2 } };
        it<Nested>("cannot set discriminant when other fields depend on it (nested)", field => {
            expectTypeOf(field("type")).toEqualTypeOf<FormField<"a" | "b", never>>();
        });

        type NestedSame =
            | { type: "a"; nested: { n: 1 } }
            | { type: "b"; nested: { n: 1 } };
        it<NestedSame>("can set discriminant when all other fields are identical (nested)", field => {
            expectTypeOf(field("type")).toEqualTypeOf<FormField<"a" | "b", "a" | "b">>();
        });

        type ArrayUnion = { a: 1 } | { a: 2 };
        it<{ items: Array<ArrayUnion> }>("supports arrays of unions", field => {
            expectTypeOf(field("items")).toEqualTypeOf<FormField<ArrayUnion[], ArrayUnion[]>>();
            expectTypeOf(field("items")(0)).toEqualTypeOf<FormField<ArrayUnion | undefined, ArrayUnion>>();
        });
    })
})

type Test<T> = (field: FormField<T>) => void
function it<T>(name: string, test: Test<T>) {
    vitest_it(name, () => {
        renderHook(() => {
            const form = useForm<T, never>({ initialValues: {} as T });
            test(form);
        })
    })
}

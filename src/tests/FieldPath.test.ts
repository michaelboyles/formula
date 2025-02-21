import { test, expect, describe } from 'vitest';
import { FieldPath } from "../FieldPath";

describe("getValue", () => {
    test('Single object property', () => {
        const path = FieldPath.create().withProperty("foo");
        expect(path.getValue({ foo: "bar" })).toBe("bar");
    })

    test("Multiple object properties", () => {
        const path = FieldPath.create().withProperty("foo").withProperty("bar");
        expect(path.getValue({ foo: { bar: "baz" } })).toBe("baz");
    })

    test("Single array index", () => {
        const path = FieldPath.create().withArrayIndex(1);
        expect(path.getValue(["a", "B", "c"])).toBe("B");
    })

    test("Try to access array element when root is object", () => {
        const path = FieldPath.create().withArrayIndex(2);
        expect(() => path.getValue({})).toThrow("<form-root> is not an array");
    })

    test("Try to access property when root is array", () => {
        const path = FieldPath.create().withProperty("foo");
        expect(() => path.getValue([])).toThrow("<form-root> is an array, not an object");
    })
})

describe("getValue for invalid path", () => {
    test("Object property for number", () => {
        const path = FieldPath.create().withProperty("foo");
        expect(() => path.getValue(3)).toThrow();
    })

    test("Array index for number", () => {
        const path = FieldPath.create().withArrayIndex(1);
        expect(() => path.getValue(3)).toThrow();
    })
})

describe("getDataWithValue", () => {
    test("Set object property", () => {
        const path = FieldPath.create().withProperty("foo");

        const initial = {foo: "bar"};
        const result = path.getDataWithValue(initial, "baz");
        expect(result).toStrictEqual({ foo: "baz"});
        expect(result).toSatisfy(() => initial !== result);
    })

    test("Set array index", () => {
        const path = FieldPath.create().withArrayIndex(1);

        const initial = ["a", "X", "c"];
        const result = path.getDataWithValue(initial, "B");
        expect(result).toStrictEqual(["a", "B", "c"]);
        expect(result).toSatisfy(() => initial !== result);
    })

    test("Set nested array index", () => {
        const path = FieldPath.create().withArrayIndex(1).withArrayIndex(0);

        const initial = [["a"], ["b", "c"], ["d"]];
        const result = path.getDataWithValue(initial, "X");
        expect(result).toStrictEqual([["a"], ["X", "c"], ["d"]]);
        expect(result).toSatisfy(() => initial !== result);
        expect(initial[0]).toBe(result[0]);
        expect(initial[2]).toBe(result[2]);
    })
})

describe("toString", () => {
    test("root", () => {
        expect(FieldPath.create().toString()).toStrictEqual("<form-root>");
    })

    test("property > array", () => {
        const path = FieldPath.create().withProperty("foo").withArrayIndex(1);
        expect(path.toString()).toStrictEqual("foo[1]")
    })

    test("property > array > property", () => {
        const path = FieldPath.create().withProperty("foo").withArrayIndex(2).withProperty("bar")
        expect(path.toString()).toStrictEqual("foo[2].bar")
    })
})

describe("isRoot", () => {
    test("root", () => {
        expect(FieldPath.create().isRoot()).toBe(true)
    })

    test("non-root", () => {
        expect(FieldPath.create().withProperty("foo").isRoot()).toBe(false)
    })
})
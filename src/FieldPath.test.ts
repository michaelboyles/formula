import { test, expect, describe } from 'vitest';
import { FieldPath } from "./FieldPath";

describe("getData", () => {
    test('Single object property', () => {
        const path = FieldPath.create().withProperty("foo");
        expect(path.getData({ foo: "bar" })).toBe("bar");
    })

    test('Multiple object properties', () => {
        const path = FieldPath.create().withProperty("foo").withProperty("bar");
        expect(path.getData({ foo: { bar: "baz" } })).toBe("baz");
    })

    test('Single array index', () => {
        const path = FieldPath.create().withArrayIndex(1);
        expect(path.getData(["a", "B", "c"])).toBe("B");
    })


})

describe("getData for invalid path", () => {
    test('Object property for number', () => {
        const path = FieldPath.create().withProperty("foo");
        expect(() => path.getData(3)).toThrow();
    })

    test('Array index for number', () => {
        const path = FieldPath.create().withArrayIndex(1);
        expect(() => path.getData(3)).toThrow();
    })
})
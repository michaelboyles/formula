import { describe, expect, test } from "vitest";
import { FormStateTree } from "../FormStateTree.ts";
import { FieldPath } from "../FieldPath.ts";

describe("FormStateTree", () => {
    test("Subscribe and notify of value", () => {
        const tree = new FormStateTree();
        const rootPath = FieldPath.create();
        let notified = 0;
        const unsubscribe = tree.subscribeToValue(rootPath, () => {
            notified++;
        });
        const unsubscribe2 = tree.subscribeToValue(rootPath, () => {
            notified++;
        });
        tree.notifyValueChanged(rootPath, {});
        unsubscribe();
        unsubscribe2();

        expect(notified).toBe(2);
    })

    test("Subscribe with complex path", () => {
        const tree = new FormStateTree();
        const path = FieldPath.create().withProperty("foo").withArrayIndex(5).withProperty("bar")
        let notified = 0;
        const unsubscribe = tree.subscribeToValue(path, () => {
            notified++;
        });
        tree.notifyValueChanged(path, {});
        unsubscribe();

        expect(notified).toBe(1);
    })

    test("Errors are retained after notifying value change", () => {
        const tree = new FormStateTree();
        const path = FieldPath.create().withProperty("user").withProperty("name");
        tree.setErrors(path, ["Required"]);
        tree.notifyValueChanged(path, {});
        expect(tree.getErrors(path)).toEqual(["Required"]);
    })

    test("Errors are retained if data shape matches", () => {
        const tree = new FormStateTree();
        const userPath = FieldPath.create().withProperty("user");
        tree.setErrors(userPath.withProperty("name"), "Foo");
        tree.notifyValueChanged(userPath, { user: { name: "Michael" } });
        expect(tree.getErrors(userPath.withProperty("name"))).toEqual(["Foo"]);
    })

    test("Errors are discarded if data shape changes", () => {
        const tree = new FormStateTree();
        const userPath = FieldPath.create().withProperty("user");
        tree.setErrors(userPath.withProperty("name"), "Foo");
        tree.notifyValueChanged(userPath, { user: {} });
        expect(tree.getErrors(userPath.withProperty("name"))).toEqual([]);
    })
})

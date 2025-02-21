import { describe, expect, test } from "vitest";
import { FormStateTree } from "../FormStateTree";
import { FieldPath } from "../FieldPath";

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
        tree.notifyValueChanged(rootPath);
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
        tree.notifyValueChanged(path);
        unsubscribe();

        expect(notified).toBe(1);
    })
})
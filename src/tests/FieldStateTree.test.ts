import { describe, expect, test } from "vitest";
import { FieldStateTree } from "../FieldStateTree.ts";
import { FieldPath } from "../FieldPath.ts";

describe("FieldStateTree", () => {
    test("Subscribe and notify of data", () => {
        const tree = new FieldStateTree();
        const rootPath = FieldPath.create();
        let notified = 0;
        const unsubscribe = tree.subscribeToData(rootPath, () => notified++);
        const unsubscribe2 = tree.subscribeToData(rootPath, () => notified++);
        tree.notifyDataChanged(rootPath, {});
        unsubscribe();
        unsubscribe2();

        expect(notified).toBe(2);
    })

    test("Subscribe with complex path", () => {
        const tree = new FieldStateTree();
        const path = FieldPath.create().withProperty("foo").withProperty(5).withProperty("bar")
        let notified = 0;
        const unsubscribe = tree.subscribeToData(path, () => notified++);
        tree.notifyDataChanged(path, {});
        unsubscribe();

        expect(notified).toBe(1);
    })

    test("Errors are retained after notifying data change", () => {
        const tree = new FieldStateTree();
        const path = FieldPath.create().withProperty("user").withProperty("name");
        tree.setErrors(path, ["Required"]);
        tree.notifyDataChanged(path, {});
        expect(tree.getErrors(path)).toEqual(["Required"]);
    })

    test("Errors are retained if data shape matches", () => {
        const tree = new FieldStateTree();
        const userPath = FieldPath.create().withProperty("user");
        tree.setErrors(userPath.withProperty("name"), "Foo");
        tree.notifyDataChanged(userPath, { user: { name: "Michael" } });
        expect(tree.getErrors(userPath.withProperty("name"))).toEqual(["Foo"]);
    })

    test("Errors are discarded if data shape changes", () => {
        const tree = new FieldStateTree();
        const userPath = FieldPath.create().withProperty("user");
        tree.setErrors(userPath.withProperty("name"), "Foo");
        tree.notifyDataChanged(userPath, { user: {} });
        expect(tree.getErrors(userPath.withProperty("name"))).toEqual([]);
    })

    test("Root subscribers are notified when a nested leaf changes", () => {
        const tree = new FieldStateTree();
        const rootPath = FieldPath.create();
        const leafPath = rootPath.withProperty("name");

        // GIVEN a subscriber at the root node
        let rootNotified = 0;
        tree.subscribeToData(rootPath, () => rootNotified++);
        // WHEN a leaf node is changed and subscribers are notified
        tree.notifyDataChanged(leafPath, { name: "Alice" });
        // THEN the count as incremented
        expect(rootNotified).toBe(1);
    });

    describe("isChanged", () => {
        test("setIsChanged(true)", () => {
            const tree = new FieldStateTree();
            const rootPath = FieldPath.create();
            const leafPath = rootPath.withProperty("name");

            // WHEN a leaf node is changed
            tree.setIsChanged(leafPath, true);
            // THEN both the leaf and parent are set as changed (change propagates upwards)
            expect(tree.isChanged(rootPath)).toBe(true);
            expect(tree.isChanged(leafPath)).toBe(true);
        });

        test("setIsChanged(false)", () => {
            // GIVEN a tree where a leaf is changed
            const tree = new FieldStateTree();
            const rootPath = FieldPath.create();
            const leafPath = rootPath.withProperty("name");
            tree.setIsChanged(leafPath, true);

            // WHEN a leaf node is changed
            tree.setIsChanged(leafPath, true);
            // THEN both the leaf and parent are set as changed (change propagates downwards)
            expect(tree.isChanged(rootPath)).toBe(true);
            expect(tree.isChanged(leafPath)).toBe(true);
        });
    })
})

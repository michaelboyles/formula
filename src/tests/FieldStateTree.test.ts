import { describe, expect, test, vi } from "vitest";
import { FieldStateTree } from "../FieldStateTree.ts";
import { FieldPath } from "../FieldPath.ts";

describe("FieldStateTree", () => {
    test("notifyDataChanged", () => {
        const tree = new FieldStateTree();
        const rootPath = FieldPath.create();
        const listener = vi.fn();
        const unsubscribe = tree.addDataListener(rootPath, listener);
        const unsubscribe2 = tree.addDataListener(rootPath, listener);
        tree.notifyDataChanged(rootPath, {});
        unsubscribe();
        unsubscribe2();

        expect(listener).toHaveBeenCalledTimes(2);
    })

    test("notifyDataChanged with complex path", () => {
        const tree = new FieldStateTree();
        const path = FieldPath.create().withProperty("foo").withProperty(5).withProperty("bar")
        const listener = vi.fn();
        const unsubscribe = tree.addDataListener(path, listener);
        tree.notifyDataChanged(path, {});
        unsubscribe();

        expect(listener).toHaveBeenCalledOnce();
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

    test("Root listeners are called when a nested leaf changes", () => {
        const tree = new FieldStateTree();
        const rootPath = FieldPath.create();
        const leafPath = rootPath.withProperty("name");

        // GIVEN a listener at the root node
        const listener = vi.fn();
        tree.addDataListener(rootPath, listener);
        // WHEN a leaf node is changed and listeners are notified
        tree.notifyDataChanged(leafPath, { name: "Alice" });
        // THEN the listener was called
        expect(listener).toHaveBeenCalledOnce();
    });

    test("Change status is discarded if data shape changes", () => {
        // GIVEN a tree with a leaf called foo that is changed
        const tree = new FieldStateTree();
        const rootPath = FieldPath.create();
        const fooPath = rootPath.withProperty("foo");
        tree.setIsChanged(fooPath, true);

        // WHEN we set the root data to something without "foo"
        tree.notifyDataChanged(rootPath, { bar: "bar" })

        // THEN foo is no longer changed, since the node has been dropped
        expect(tree.isChanged(fooPath)).toBe(false);
    });

    test("addDataListener", () => {
        const tree = new FieldStateTree();
        const rootPath = FieldPath.create();
        const fooPath = rootPath.withProperty("foo");
        const barPath = rootPath.withProperty("bar");

        const rootListener = vi.fn();
        const fooListener = vi.fn();
        const barListener = vi.fn();
        tree.addDataListener(rootPath, rootListener);
        tree.addDataListener(fooPath, fooListener);
        tree.addDataListener(barPath, barListener);

        tree.notifyDataChanged(fooPath, { foo: "newFoo" });
        expect(rootListener).toHaveBeenCalledExactlyOnceWith({ foo: "newFoo" });
        expect(fooListener).toHaveBeenCalledExactlyOnceWith("newFoo");
        expect(barListener).not.toHaveBeenCalled();
    })

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

    describe("resetData", () => {
        test("clears errors, blurred, and isChanged on existing nodes", () => {
            const tree = new FieldStateTree();
            const path = FieldPath.create().withProperty("foo");
            tree.setErrors(path, "error");
            tree.setBlurred(path, true);
            tree.setIsChanged(path, true);

            tree.resetData({ foo: "foo" }, { foo: "bar" });

            expect(tree.getErrors(path)).toHaveLength(0);
            expect(tree.blurred(path)).toBe(false);
            expect(tree.isChanged(path)).toBe(false);
        });

        test("clears deep errors for parent nodes", () => {
            const tree = new FieldStateTree();
            const parent = FieldPath.create().withProperty("foo");
            const child = parent.withProperty("bar");
            tree.setErrors(child, "error");

            const data = { foo: { bar: "baz" } };
            tree.resetData(data, data);

            expect(tree.getDeepErrors(parent)).toEqual([]);
        });

        test("removes nodes that no longer exist in new data", () => {
            const tree = new FieldStateTree();
            const path = FieldPath.create().withProperty("foo");
            tree.setErrors(path, "error");
            tree.setBlurred(path, true);
            tree.setIsChanged(path, true);

            tree.resetData({ foo: "foo" }, {}); // foo no longer exists

            expect(tree.getErrors(path)).toHaveLength(0);
            expect(tree.blurred(path)).toBe(false);
            expect(tree.isChanged(path)).toBe(false);
        });

        test("notifies listeners when state is cleared", () => {
            const tree = new FieldStateTree();
            const path = FieldPath.create().withProperty("foo");
            tree.setErrors(path, "error");
            tree.setBlurred(path, true);
            tree.setIsChanged(path, true);
            const errorSub = vi.fn();
            const blurredSub = vi.fn();
            const changedSub = vi.fn();
            tree.addErrorListener(path, errorSub);
            tree.addBlurListener(path, blurredSub);
            tree.addIsChangedListener(path, changedSub);

            tree.resetData({ foo: "foo" }, { foo: "foo" });

            expect(errorSub).toHaveBeenCalledExactlyOnceWith([]);
            expect(blurredSub).toHaveBeenCalledExactlyOnceWith(false);
            expect(changedSub).toHaveBeenCalledExactlyOnceWith(false);
        });

        test("does not notify listeners if no state changed", () => {
            const tree = new FieldStateTree();
            const path = FieldPath.create().withProperty("bar");
            const errorSub = vi.fn();
            const blurredSub = vi.fn();
            const changedSub = vi.fn();
            tree.addErrorListener(path, errorSub);
            tree.addBlurListener(path, blurredSub);
            tree.addIsChangedListener(path, changedSub);

            tree.resetData({ bar: "bar"}, { bar: "bar" });

            expect(errorSub).not.toHaveBeenCalled();
            expect(blurredSub).not.toHaveBeenCalled();
            expect(changedSub).not.toHaveBeenCalled();
        });
    });
})

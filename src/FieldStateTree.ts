import { FieldPath } from "./FieldPath.ts";
import type { Listener } from "./FormField.ts";

const NO_ERRORS = Object.freeze([] as string[]);

type ErrorList = ReadonlyArray<string>

// Holds state for each of the form's fields
export class FieldStateTree {
    private root: TreeNode = {}

    hasError() {
        return hasError(this.root);
    }

    getErrors(path: FieldPath): ErrorList {
        const node = this.getNode(path);
        if (node) {
            return node.errors ?? NO_ERRORS;
        }
        return NO_ERRORS;
    }

    appendErrors(path: FieldPath, errors: string[]) {
        if (!errors || errors.length < 1) return;
        const nodes = this.getOrCreateNodes(path);
        const leaf = nodes[nodes.length - 1];
        if (!leaf.errors) {
            leaf.errors = [];
        }
        leaf.errors.push(...errors);
        leaf.errorListeners?.forEach(notify => notify(leaf.errors));
        nodes.forEach(n => {
            n.deepErrors?.markStale();
            n.deepErrorListeners?.forEach(notify => notify());
        })
    }

    setErrors(path: FieldPath, errors: string | string[] | undefined) {
        const nodes = this.getOrCreateNodes(path);
        const leaf = nodes[nodes.length - 1];
        let changed: boolean;
        if (!errors || errors.length < 1) {
            changed = !!leaf.errors && leaf.errors.length > 0;
            delete leaf.errors;
        }
        else {
            const prev = leaf.errors;
            leaf.errors = typeof errors === "string" ? [errors] : [...errors];
            changed = !isEqual(prev, leaf.errors);
        }

        if (changed) {
            leaf.errorListeners?.forEach(notify => notify(leaf.errors ?? NO_ERRORS));
            nodes.forEach(n => {
                n.deepErrors?.markStale();
                n.deepErrorListeners?.forEach(notify => notify());
            });
        }
    }

    clearAllErrors() {
        this.clearErrorsForNode(this.root);
    }

    private clearErrorsForNode(node: TreeNode): boolean {
        const changed = (node.errors?.length ?? 0) > 0;
        delete node.errors;
        if (changed) {
            node.errorListeners?.forEach(notify => notify(NO_ERRORS));
        }

        let childChanged = false;
        for (const child of Object.values(node.propertyToNode ?? {})) {
            if (this.clearErrorsForNode(child)) {
                childChanged = true;
            }
        }

        if (changed || childChanged) {
            node.deepErrors?.markStale();
            node.deepErrorListeners?.forEach(notify => notify(NO_ERRORS));
            return true;
        }
        return false;
    }

    getDeepErrors(path: FieldPath): ErrorList {
        const node = this.getNode(path);
        if (!node) return NO_ERRORS;

        const computeErrors = () => {
            const errors: string[] = [];
            this.visitAllChildren(node, n => {
                if (n.errors && n.errors.length) {
                    errors.push(...n.errors);
                }
            });
            return errors;
        }
        if (!node.deepErrors) {
            node.deepErrors = new CachedValue(computeErrors);
        }
        return node.deepErrors.get(computeErrors);
    }

    blurred(path: FieldPath): boolean {
        const node = this.getNode(path);
        return node?.blurred ?? false;
    }

    setBlurred(path: FieldPath, blurred: boolean) {
        for (let i = 0; i < path.keys.length; ++i) {
            const node = this.getOrCreateNode(path.sliceTo(i + 1));
            if (node.blurred !== blurred) {
                node.blurred = blurred;
                node.blurredListeners?.forEach(notify => notify(blurred));
            }
        }
    }

    isChanged(path: FieldPath): boolean {
        const node = this.getNode(path);
        return node?.isChanged ?? false;
    }

    setIsChanged(path: FieldPath, isChanged: boolean) {
        if (isChanged) {
            // Marking a leaf as changed propagates up the tree
            for (let i = 0; i < path.keys.length + 1; ++i) {
                const node = this.getOrCreateNode(path.sliceTo(i));
                if (!node.isChanged) {
                    node.isChanged = true;
                    node.isChangedListeners?.forEach(notify => notify(true));
                }
            }
        }
        else {
            // Marking a parent as unchanged propagates down the tree
            const node = this.getNode(path);
            if (!node) return;
            this.visitAllChildren(node, n => {
                if (n.isChanged) {
                    delete n.isChanged;
                    node.isChangedListeners?.forEach(notify => notify(false));
                }
            });
        }
    }

    addDataListener(path: FieldPath, listener: Listener<unknown>): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.dataListeners = pushOrCreateArray(node.dataListeners, listener);
        return () => {
            node.dataListeners = removeFromArray(node.dataListeners, listener);
        }
    }

    addErrorListener(path: FieldPath, listener: Listener<ErrorList>): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.errorListeners = pushOrCreateArray(node.errorListeners, listener);
        return () => {
            node.errorListeners = removeFromArray(node.errorListeners, listener);
        }
    }

    addDeepErrorsListener(path: FieldPath, listener: Listener<ErrorList>): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.deepErrorListeners = pushOrCreateArray(node.deepErrorListeners, listener);
        return () => {
            node.deepErrorListeners = removeFromArray(node.deepErrorListeners, listener);
        }
    }

    addBlurListener(path: FieldPath, listener: Listener<boolean>): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.blurredListeners = pushOrCreateArray(node.blurredListeners, listener);
        return () => {
            node.blurredListeners = removeFromArray(node.blurredListeners, listener);
        }
    }

    addIsChangedListener(path: FieldPath, listener: Listener<boolean>): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.isChangedListeners = pushOrCreateArray(node.isChangedListeners, listener);
        return () => {
            node.isChangedListeners = removeFromArray(node.isChangedListeners, listener);
        }
    }

    private getOrCreateNode(path: FieldPath): TreeNode {
        const nodes = this.getOrCreateNodes(path);
        return nodes[nodes.length - 1];
    }

    private getOrCreateNodes(path: FieldPath): TreeNode[] {
        const nodes: TreeNode[] = [this.root];
        for (const key of path.keys) {
            const current = nodes[nodes.length - 1];
            let propertyToNode = current.propertyToNode;
            if (!propertyToNode) {
                propertyToNode = {};
                current.propertyToNode = propertyToNode;
            }

            const name = key as string | number;
            let next = propertyToNode[name];
            if (!next) {
                next = {};
                propertyToNode[name] = next;
            }
            nodes.push(next);
        }
        return nodes;
    }

    private getNode(path: FieldPath): TreeNode | undefined {
        let node = this.root;
        for (const key of path.keys) {
            const next = node.propertyToNode?.[key as string | number];
            if (!next) return;
            node = next;
        }
        return node;
    }

    notifyDataChanged(path: FieldPath, newData: any) {
        let currentNode: TreeNode | undefined = this.root;
        // Descend the tree and notify just the leaves along the way, until the final leaf, then finally notify all
        // children
        if (path.isRoot()) {
            this.notifyAllData(currentNode, newData);
            this.clearStateAndPrune(currentNode, newData);
            return;
        }
        currentNode.dataListeners?.forEach(notify => notify(newData));
        for (let i = 0; i < path.keys.length; i++) {
            const key = path.keys[i];
            currentNode = currentNode.propertyToNode?.[key as string | number];
            newData = newData?.[key];

            if (!currentNode) return;
            if (i === path.keys.length - 1) {
                this.notifyAllData(currentNode, newData);
                this.clearStateAndPrune(currentNode, newData);
            }
            else {
                currentNode.dataListeners?.forEach(notify => notify(newData));
            }
        }
    }

    resetData(oldData: any, newData: any) {
        this.resetNode(this.root, oldData, newData);
    }

    private resetNode(node: TreeNode, oldData: any, newData: any) {
        if (!isEqual(oldData, newData)) {
            node.dataListeners?.forEach(notify => notify(newData));
        }
        if (node.errors?.length) {
            delete node.errors;
            node.errorListeners?.forEach(notify => notify(NO_ERRORS));
        }
        if (node.deepErrors) {
            delete node.deepErrors;
            node.deepErrorListeners?.forEach(notify => notify(NO_ERRORS));
        }
        if (node.blurred) {
            delete node.blurred;
            node.blurredListeners?.forEach(notify => notify(false));
        }
        if (node.isChanged) {
            delete node.isChanged;
            node.isChangedListeners?.forEach(notify => notify(false));
        }

        // Recurse into children
        if (!node.propertyToNode) return;
        for (const [key, child] of Object.entries(node.propertyToNode)) {
            if (!Object.hasOwn(newData, key)) {
                this.visitAllChildren(child, n => {
                    n.dataListeners?.forEach(notify => notify(undefined));
                    if (n.errors) {
                        n.errorListeners?.forEach(notify => notify(NO_ERRORS))
                    }
                    if (n.deepErrors) {
                        n.deepErrorListeners?.forEach(notify => notify(NO_ERRORS));
                    }
                    if (n.isChanged) {
                        n.isChangedListeners?.forEach(notify => notify(false));
                    }
                    if (n.blurred) {
                        n.blurredListeners?.forEach(notify => notify(false));
                    }
                })
                delete node.propertyToNode[key];
            }
            else {
                const nextOldData = (oldData as any)?.[key];
                const nextNewData = (newData as any)?.[key];
                this.resetNode(child, nextOldData, nextNewData);
            }
        }

        if (Object.keys(node.propertyToNode).length === 0) {
            delete node.propertyToNode;
        }
    }

    private visitAllChildren(node: TreeNode, visit: (n: TreeNode) => void) {
        visit(node);
        node.propertyToNode && Object.values(node.propertyToNode).forEach(child => {
            this.visitAllChildren(child, visit);
        });
    }

    private visitAllChildrenWithData(node: TreeNode, data: any, visit: (n: TreeNode, data: any) => void) {
        visit(node, data);
        if (!node.propertyToNode) return;
        for (const [key, child] of Object.entries(node.propertyToNode)) {
            const nextData = data?.[key];
            this.visitAllChildrenWithData(child, nextData, visit);
        }
    }

    private notifyAllData(node: TreeNode, data: any) {
        this.visitAllChildrenWithData(node, data, (n, d) => {
            n.dataListeners?.forEach(notify => notify(d));
        });
    }

    private clearStateAndPrune(node: TreeNode, data: any) {
        if (node.propertyToNode) {
            for (const [key, child] of Object.entries(node.propertyToNode)) {
                const nextData = data?.[key];
                this.clearStateAndPrune(child, nextData);
                if (nextData === undefined) {
                    delete child.errors;
                    delete child.blurred;
                    delete child.isChanged;
                    if (this.isNodeEmpty(child)) {
                        delete node.propertyToNode[key];
                    }
                }
            }
            if (Object.keys(node.propertyToNode).length === 0) {
                delete node.propertyToNode;
            }
        }
    }

    private isNodeEmpty(node: TreeNode): boolean {
        const hasState = node.blurred === true
            || node.isChanged === true
            || (node.errors && node.errors.length > 0)
            || (node.propertyToNode && Object.keys(node.propertyToNode).length > 0)
            || (node.dataListeners && node.dataListeners.length > 0)
            || (node.errorListeners && node.errorListeners.length > 0)
            || (node.blurredListeners && node.blurredListeners.length > 0);
        return !hasState;
    }
}

type TreeNode = {
    propertyToNode?: Record<string, TreeNode>
    errors?: string[]
    deepErrors?: CachedValue<string[]>
    blurred?: boolean
    isChanged?: boolean

    // listeners
    dataListeners?: Listener<any>[]
    errorListeners?: Listener<ErrorList>[]
    deepErrorListeners?: Listener<ErrorList>[]
    blurredListeners?: Listener<boolean>[]
    isChangedListeners?: Listener<boolean>[]
}

export type Unsubscribe = () => void;
export type Subscriber = () => void;

function hasError(start: TreeNode) {
    if (start.errors?.length) return true;
    if (start.propertyToNode) {
        for (const node of Object.values(start.propertyToNode)) {
            if (hasError(node)) return true;
        }
    }
    return false;
}

function removeFromArray<T>(items: T[] | undefined, item: T): T[] | undefined {
    if (!items) return undefined;
    const newItems = items.filter(i => i !== item);
    if (newItems.length === 0) {
        return undefined;
    }
    return newItems;
}

function pushOrCreateArray<T>(items: T[] | undefined, item: T): T[] {
    if (items) {
        items.push(item);
        return items;
    }
    return [item];
}

class CachedValue<T> {
    private value: T
    private fresh: boolean

    constructor(calc: () => T) {
        this.value = calc();
        this.fresh = true;
    }

    markStale() {
        this.fresh = false;
    }

    get(calc: () => T) {
        if (this.fresh) {
            return this.value;
        }
        this.value = calc();
        this.fresh = true;
        return this.value;
    }
}

function isEqual(first: unknown, second: unknown): boolean {
    if (first === second) return true;
    const firstType = typeof first;
    if (firstType !== typeof second) return false;
    if (Array.isArray(first)) {
        if (Array.isArray(second)) {
            return isArrayEquals(first, second);
        }
        return false;
    }
    if (firstType === 'object') {
        if (first === null || second === null) return false;
        const firstEntries = Object.entries(first as object);
        const secondKeys = Object.keys(second as object);
        if (firstEntries.length === secondKeys.length) {
            for (let i = 0; i < firstEntries.length; i++) {
                const [firstKey, firstValue] = firstEntries[i];
                if (firstValue === undefined) {
                    if (!secondKeys.includes(firstKey) || (second as any)[firstKey] !== undefined) {
                        return false;
                    }
                }
                else {
                    const secondValue = (second as any)[firstKey];
                    if (!isEqual(firstValue, secondValue)) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }
    if (firstType === 'number') {
        return Number.isNaN(first) && Number.isNaN(second);
    }
    return false;
}

function isArrayEquals(first: unknown[], second: unknown[]): boolean {
    if (first.length !== second.length) return false;
    for (let i = 0; i < first.length; i++) {
        if (!isEqual(first[i], second[i])) return false;
    }
    return true;
}

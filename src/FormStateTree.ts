import { FieldPath } from "./FieldPath.ts";

const NO_ERRORS = Object.freeze([] as string[]);

export class FormStateTree {
    private root: TreeNode = {}

    hasError() {
        return hasError(this.root);
    }

    getErrors(path: FieldPath): ReadonlyArray<string> {
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
        leaf.errorSubscribers?.forEach(notify => notify());
        nodes.forEach(n => {
            n.deepErrors?.markStale();
            n.deepErrorSubscribers?.forEach(notify => notify());
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
            leaf.errorSubscribers?.forEach(notify => notify());
            nodes.forEach(n => {
                n.deepErrors?.markStale();
                n.deepErrorSubscribers?.forEach(notify => notify());
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
            node.errorSubscribers?.forEach(notify => notify());
        }

        let childChanged = false;
        for (const child of Object.values(node.propertyToNode ?? {})) {
            if (this.clearErrorsForNode(child)) {
                childChanged = true;
            }
        }
        for (const child of Object.values(node.indexToNode ?? {})) {
            if (this.clearErrorsForNode(child)) {
                childChanged = true;
            }
        }

        if (changed || childChanged) {
            node.deepErrors?.markStale();
            node.deepErrorSubscribers?.forEach(notify => notify());
            return true;
        }
        return false;
    }

    getDeepErrors(path: FieldPath): ReadonlyArray<string> {
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
        for (let i = 0; i < path.nodes.length; ++i) {
            const node = this.getOrCreateNode(path.sliceTo(i + 1));
            if (node.blurred !== blurred) {
                node.blurred = blurred;
                node.blurredSubscribers?.forEach(notify => notify());
            }
        }
    }

    subscribeToValue(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "valueSubscribers", subscriber);
    }

    subscribeToErrors(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "errorSubscribers", subscriber);
    }

    subscribeToDeepErrors(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "deepErrorSubscribers", subscriber);
    }

    subscribeToBlurred(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "blurredSubscribers", subscriber);
    }

    private subscribe<K extends keyof Subscribers>(path: FieldPath, key: K, subscriber: Subscriber): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node[key] = pushOrCreateArray(node[key], subscriber);
        return () => {
            node[key] = removeFromArray(node[key], subscriber);
        }
    }

    private getOrCreateNode(path: FieldPath): TreeNode {
        const nodes = this.getOrCreateNodes(path);
        return nodes[nodes.length - 1];
    }

    private getOrCreateNodes(path: FieldPath): TreeNode[] {
        const nodes: TreeNode[] = [this.root];
        for (const pathPart of path.nodes) {
            const current = nodes[nodes.length - 1];
            if (pathPart.type === "property") {
                let propertyToNode = current.propertyToNode;
                if (!propertyToNode) {
                    propertyToNode = {};
                    current.propertyToNode = propertyToNode;
                }

                const name = pathPart.value as string | number;
                let next = propertyToNode[name];
                if (!next) {
                    next = {};
                    propertyToNode[name] = next;
                }
                nodes.push(next);
            }
            else if (pathPart.type === "index") {
                let indexToNode = current.indexToNode;
                if (!indexToNode) {
                    indexToNode = {};
                    current.indexToNode = indexToNode;
                }

                const index = pathPart.index;
                let next = indexToNode[index];
                if (!next) {
                    next = {};
                    indexToNode[index] = next;
                }
                nodes.push(next);
            }
        }
        return nodes;
    }

    private getNode(path: FieldPath): TreeNode | undefined {
        let node = this.root;
        for (const pathPart of path.nodes) {
            if (pathPart.type === "property") {
                const next = node.propertyToNode?.[pathPart.value as string | number];
                if (!next) return;
                node = next;
            }
            else if (pathPart.type === "index") {
                const next = node.indexToNode?.[pathPart.index];
                if (!next) return;
                node = next;
            }
        }
        return node;
    }

    notifyValueChanged(path: FieldPath, newData: any) {
        let currentNode: TreeNode | undefined = this.root;
        // Descend the tree and notify just the leaves along the way, until the final leaf, then finally notify all
        // children
        if (path.isRoot()) {
            this.notifyAll(currentNode, n => n.valueSubscribers);
            this.clearStateAndPrune(currentNode, newData);
            return;
        }
        for (let i = 0; i < path.nodes.length; i++) {
            const node = path.nodes[i];
            if (node.type === "property") {
                currentNode = currentNode.propertyToNode?.[node.value as string | number];
                newData = newData?.[node.value];
            }
            else {
                currentNode = currentNode.indexToNode?.[node.index];
                newData = Array.isArray(newData) ? newData[node.index] : undefined;
            }
            if (!currentNode) return;
            if (i === path.nodes.length - 1) {
                this.notifyAll(currentNode, n => n.valueSubscribers);
                this.clearStateAndPrune(currentNode, newData);
            }
            else {
                currentNode.valueSubscribers?.forEach(notifySub => notifySub());
            }
        }
    }

    private visitAllChildren(node: TreeNode, visit: (n: TreeNode) => void) {
        visit(node);
        node.propertyToNode && Object.values(node.propertyToNode).forEach(child => {
            this.visitAllChildren(child, visit);
        });
        node.indexToNode && Object.values(node.indexToNode).forEach(child => {
            this.visitAllChildren(child, visit);
        });
    }

    private notifyAll(node: TreeNode, getSubscribers: (n: TreeNode) => Subscriber[] | undefined) {
        this.visitAllChildren(node, n => {
            getSubscribers(n)?.forEach(notifySub => notifySub());
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
                    if (this.isNodeEmpty(child)) {
                        delete node.propertyToNode[key];
                    }
                }
            }
            if (Object.keys(node.propertyToNode).length === 0) {
                delete node.propertyToNode;
            }
        }
        if (node.indexToNode) {
            for (const [key, child] of Object.entries(node.indexToNode)) {
                const index = Number(key);
                const nextData = Array.isArray(data) ? data?.[index] : undefined;
                this.clearStateAndPrune(child, nextData);
                if (nextData === undefined) {
                    delete child.errors;
                    delete child.blurred;
                    if (this.isNodeEmpty(child)) {
                        delete node.indexToNode[index];
                    }
                }
            }
            if (Object.keys(node.indexToNode).length === 0) {
                delete node.indexToNode;
            }
        }
    }

    private isNodeEmpty(node: TreeNode): boolean {
        const hasState = node.blurred === true
            || (node.errors && node.errors.length > 0)
            || (node.propertyToNode && Object.keys(node.propertyToNode).length > 0)
            || (node.indexToNode && Object.keys(node.indexToNode).length > 0)
            || (node.valueSubscribers && node.valueSubscribers.length > 0)
            || (node.errorSubscribers && node.errorSubscribers.length > 0)
            || (node.blurredSubscribers && node.blurredSubscribers.length > 0);
        return !hasState;
    }
}

type TreeNode = {
    propertyToNode?: Record<string, TreeNode>
    indexToNode?: Record<number, TreeNode>
    errors?: string[]
    deepErrors?: CachedValue<string[]>
    blurred?: boolean
} & Subscribers;
type Subscribers = {
    valueSubscribers?: Subscriber[]
    errorSubscribers?: Subscriber[]
    deepErrorSubscribers?: Subscriber[]
    blurredSubscribers?: Subscriber[]
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
    if (start.indexToNode) {
        for (const node of Object.values(start.indexToNode)) {
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

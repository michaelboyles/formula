import { FieldPath } from "./FieldPath";

export class FormStateTree {
    private root: TreeNode = {}

    hasError() {
        return hasError(this.root);
    }

    getErrors(path: FieldPath): ReadonlyArray<string> | undefined {
        const node = this.getNode(path);
        if (node) {
            return node.errors;
        }
    }

    setErrors(path: FieldPath, errors: string[]) {
        const node = this.getOrCreateNode(path);
        node.errors = [...errors];
        node.errorSubscribers?.forEach(notify => notify());
    }

    clearAllErrors() {
        this.visitAllChildren(this.root, node => {
            delete node.errors;
            node.errorSubscribers?.forEach(notify => notify());
        });
    }

    isTouched(path: FieldPath): boolean {
        const node = this.getNode(path);
        return node?.touched ?? false;
    }

    setTouched(path: FieldPath, touched: boolean) {
        for (let i = 0; i < path.nodes.length; ++i) {
            const node = this.getOrCreateNode(path.sliceTo(i + 1));
            node.touched = touched;
            node.touchedSubscribers?.forEach(notify => notify());
        }
    }

    subscribeToValue(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "valueSubscribers", subscriber);
    }

    subscribeToErrors(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "errorSubscribers", subscriber);
    }

    subscribeToTouched(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        return this.subscribe(path, "touchedSubscribers", subscriber);
    }

    private subscribe<K extends keyof Subscribers>(path: FieldPath, key: K, subscriber: Subscriber): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node[key] = pushOrCreateArray(node[key], subscriber);
        return () => {
            node[key] = removeFromArray(node[key], subscriber);
        }
    }

    private getOrCreateNode(path: FieldPath): TreeNode {
        let node = this.root;
        for (const pathPart of path.nodes) {
            switch (pathPart.type) {
                case "property": {
                    let propertyToNode = node.propertyToNode;
                    if (!propertyToNode) {
                        propertyToNode = {};
                        node.propertyToNode = propertyToNode;
                    }

                    const name = pathPart.name;
                    let next = propertyToNode[name];
                    if (!next) {
                        next = {};
                        propertyToNode[name] = next;
                    }
                    node = next;
                    break;
                }
                case "index": {
                    let indexToNode = node.indexToNode;
                    if (!indexToNode) {
                        indexToNode = {};
                        node.indexToNode = indexToNode;
                    }

                    const index = pathPart.index;
                    let next = indexToNode[index];
                    if (!next) {
                        next = {};
                        indexToNode[index] = next;
                    }
                    node = next;
                    break;
                }
            }
        }
        return node;
    }

    private getNode(path: FieldPath): TreeNode | undefined {
        let node = this.root;
        for (const pathPart of path.nodes) {
            switch (pathPart.type) {
                case "property": {
                    const next = node.propertyToNode?.[pathPart.name];
                    if (!next) return;
                    node = next;
                    break;
                }
                case "index": {
                    const next = node.indexToNode?.[pathPart.index];
                    if (!next) return;
                    node = next;
                    break;
                }
            }
        }
        return node;
    }

    notifyValueChanged(path: FieldPath) {
        let currentNode: TreeNode | undefined = this.root;
        // Descend the tree and notify just the leaves along the way, until the final leaf, then finally notify all
        // children
        if (path.isRoot()) {
            this.notifyAll(currentNode, n => n.valueSubscribers);
            return;
        }
        for (let i = 0; i < path.nodes.length; i++) {
            if (!currentNode) return;
            currentNode.valueSubscribers?.forEach(notifySub => notifySub());
            if (i === path.nodes.length - 1) {
                this.notifyAll(currentNode, n => n.valueSubscribers);
            }
            else {
                const node = path.nodes[i];
                switch (node.type) {
                    case "property": {
                        currentNode = currentNode.propertyToNode?.[node.name];
                        break;
                    }
                    case "index": {
                        currentNode = currentNode.indexToNode?.[node.index];
                        break;
                    }
                }
            }
        }
    }

    private visitAllChildren(node: TreeNode, visit: (n: TreeNode) => void) {
        visit(node);
        node.propertyToNode && Object.values(node.propertyToNode).forEach(node => {
            this.visitAllChildren(node, visit);
        })
        node.indexToNode && Object.values(node.indexToNode).forEach(node => {
            this.visitAllChildren(node, visit);
        })
    }

    private notifyAll(node: TreeNode, getSubscribers: (n: TreeNode) => Subscriber[] | undefined) {
        this.visitAllChildren(node, n => {
            getSubscribers(n)?.forEach(notifySub => notifySub());
        });
    }
}

type TreeNode = {
    propertyToNode?: Record<string, TreeNode>
    indexToNode?: Record<number, TreeNode>
    errors?: string[],
    touched?: boolean
} & Subscribers;
type Subscribers = {
    valueSubscribers?: Subscriber[]
    errorSubscribers?: Subscriber[]
    touchedSubscribers?: Subscriber[]
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
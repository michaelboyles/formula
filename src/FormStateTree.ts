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

    subscribeToErrors(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.errorSubscribers = pushOrCreateArray(node.errorSubscribers, subscriber);
        return () => {
            node.errorSubscribers = removeFromArray(node.errorSubscribers, subscriber);
        }
    }

    subscribeToValue(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.subscribers = pushOrCreateArray(node.subscribers, subscriber);
        return () => {
            node.subscribers = node.subscribers?.filter(s => s !== subscriber);
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
            this.notifyAll(currentNode, n => n.subscribers);
            return;
        }
        for (let i = 0; i < path.nodes.length; i++) {
            if (!currentNode) return;
            currentNode.subscribers?.forEach(notifySub => notifySub());
            if (i === path.nodes.length - 1) {
                this.notifyAll(currentNode, n => n.subscribers);
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

    private notifyAll(node: TreeNode, which: (n: TreeNode) => Subscriber[] | undefined) {
        const subscribers = which(node);
        subscribers?.forEach(notifySub => notifySub());
        node.propertyToNode && Object.values(node.propertyToNode).forEach(node => {
            this.notifyAll(node, which);
        })
        node.indexToNode && Object.values(node.indexToNode).forEach(node => {
            this.notifyAll(node, which);
        })
    }
}

type TreeNode = {
    propertyToNode?: Record<string, TreeNode>
    indexToNode?: Record<number, TreeNode>
    subscribers?: Subscriber[]
    errors?: string[],
    errorSubscribers?: Subscriber[]
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
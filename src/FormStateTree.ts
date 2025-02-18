import { FieldPath } from "./FieldPath";

export class FormStateTree {
    #root: TreeNode = emptyNode();

    getErrors(path: FieldPath): string[] | undefined {
        const node = this.getNode(path);
        if (node) {
            return node.errors;
        }
    }

    setErrors(path: FieldPath, errors: string[]) {
        const node = this.getOrCreateNode(path);
        node.errors = [...errors];
        node.errorSubscribers.forEach(notify => notify());
    }

    subscribeToErrors(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.errorSubscribers.push(subscriber);
        return () => {
            node.errorSubscribers = node.errorSubscribers.filter(s => s !== subscriber);
        }
    }

    subscribeToValue(path: FieldPath, subscriber: Subscriber): Unsubscribe {
        const node = this.getOrCreateNode(path);
        node.subscribers.push(subscriber);
        return () => {
            node.subscribers = node.subscribers.filter(s => s !== subscriber);
        }
    }

    private getOrCreateNode(path: FieldPath): TreeNode {
        let node = this.#root;
        path.forEachNode(pathPart => {
            switch (pathPart.type) {
                case "property": {
                    const name = pathPart.name;
                    if (!node.propertyToNode[name]) {
                        node.propertyToNode[name] = emptyNode();
                    }
                    node = node.propertyToNode[name];
                    break;
                }
                case "index": {
                    const index = pathPart.index;
                    if (!node.indexToNode[index]) {
                        node.indexToNode[index] = emptyNode();
                    }
                    node = node.indexToNode[index];
                    break;
                }
            }
        });
        return node;
    }

    private getNode(path: FieldPath): TreeNode | undefined {
        let node = this.#root;
        for (const pathPart of path.parts()) {
            switch (pathPart.type) {
                case "property": {
                    const next = node.propertyToNode[pathPart.name];
                    if (!next) return;
                    node = next;
                    break;
                }
                case "index": {
                    const next = node.indexToNode[pathPart.index];
                    if (!next) return;
                    node = next;
                    break;
                }
            }
        }
        return node;
    }

    notifyValueChanged(path: FieldPath) {
        let currentNode = this.#root;
        // Descend the tree and notify just the leaves along the way, until the final leaf, then finally notify all
        // children
        if (path.isRoot()) {
            this.notifyAll(currentNode, n => n.subscribers);
        }
        else {
            path.forEachNode((pathPart, { isLast }) => {
                if (!currentNode) return;
                currentNode.subscribers.forEach(notifySub => notifySub());
                if (isLast) {
                    this.notifyAll(currentNode, n => n.subscribers);
                }
                else {
                    switch (pathPart.type) {
                        case "property": {
                            currentNode = currentNode.propertyToNode[pathPart.name];
                            break;
                        }
                        case "index": {
                            currentNode = currentNode.indexToNode[pathPart.index];
                            break;
                        }
                    }
                }
            });
        }
    }

    private notifyAll(node: TreeNode, which: (n: TreeNode) => Subscriber[]) {
        const subscribers = which(node);
        subscribers.forEach(notifySub => notifySub());
        Object.values(node.propertyToNode).forEach(node => {
            this.notifyAll(node, which);
        })
        Object.values(node.indexToNode).forEach(node => {
            this.notifyAll(node, which);
        })
    }
}

function emptyNode(): TreeNode {
    return {
        propertyToNode: {},
        indexToNode: {},
        subscribers: [],
        errors: [],
        errorSubscribers: []
    }
}

type TreeNode = {
    propertyToNode: Record<string, TreeNode>
    indexToNode: Record<number, TreeNode>
    subscribers: Subscriber[]
    errors: string[],
    errorSubscribers: Subscriber[]
}

export type Unsubscribe = () => void;
export type Subscriber = () => void;
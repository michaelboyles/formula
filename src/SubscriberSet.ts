import { FieldPath } from "./FieldPath";

export class SubscriberSet {
    #root: SubscriptionNode = emptySubscriptionNode();

    subscribe(path: FieldPath, subscriber: Subscriber) {
        let node = this.#root;
        path.forEachNode(pathPart => {
            switch (pathPart.type) {
                case "property": {
                    const name = pathPart.name;
                    if (!node.propertyToNode[name]) {
                        node.propertyToNode[name] = emptySubscriptionNode();
                    }
                    node = node.propertyToNode[name];
                    break;
                }
                case "index": {
                    const index = pathPart.index;
                    if (!node.indexToNode[index]) {
                        node.indexToNode[index] = emptySubscriptionNode();
                    }
                    node = node.indexToNode[index];
                    break;
                }
            }
        });
        node.subscribers.push(subscriber);
    }

    unsubscribe(path: FieldPath, subscriber: Subscriber) {
        let node = this.#root;
        let stop = false;
        path.forEachNode((pathPart, { isLast }) => {
            if (stop) return;
            switch (pathPart.type) {
                case "property": {
                    if (!node.propertyToNode[pathPart.name]) {
                        stop = true;
                    }
                    else {
                        node = node.propertyToNode[pathPart.name];
                        if (isLast) {
                            node.subscribers = node.subscribers.filter(s => s !== subscriber)
                        }
                    }
                    break;
                }
                case "index": {
                    if (!node.indexToNode[pathPart.index]) {
                        stop = true;
                    }
                    else {
                        node = node.indexToNode[pathPart.index];
                        if (isLast) {
                            node.subscribers = node.subscribers.filter(s => s !== subscriber)
                        }
                    }
                    break;
                }
            }
        });
    }

    notify(path: FieldPath) {
        let currentNode = this.#root;
        // Descend the tree and notify just the leaves along the way, until the final leaf, then finally notify all
        // children
        if (path.isRoot()) {
            this.#notifyAll(currentNode);
        }
        else {
            path.forEachNode((pathPart, { isLast }) => {
                if (!currentNode) return;
                currentNode.subscribers.forEach(notifySub => notifySub());
                if (isLast) {
                    this.#notifyAll(currentNode);
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

    #notifyAll(node: SubscriptionNode) {
        node.subscribers.forEach(notifySub => notifySub());
        Object.values(node.propertyToNode).forEach(node => {
            this.#notifyAll(node);
        })
        Object.values(node.indexToNode).forEach(node => {
            this.#notifyAll(node);
        })
    }
}

function emptySubscriptionNode(): SubscriptionNode {
    return {
        propertyToNode: {},
        indexToNode: {},
        subscribers: []
    }
}

type SubscriptionNode = {
    propertyToNode: Record<string, SubscriptionNode>
    indexToNode: Record<number, SubscriptionNode>
    subscribers: Subscriber[]
}

export type Unsubscribe = () => void;
export type Subscriber = () => void;
import { FieldPath } from "./FieldPath";

export class SubscriberSet {
    #root: SubscriptionNode = emptySubscriptionNode();

    subscribe(path: FieldPath, subscriber: Subscriber) {
        let node = this.#root;
        path.forEachNode(pathPart => {
            switch (pathPart.type) {
                case "property": {
                    if (!node.propertyToNode[pathPart.name]) {
                        node.propertyToNode[pathPart.name] = emptySubscriptionNode();
                    }
                    node = node.propertyToNode[pathPart.name];
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
                }
            }
        });
    }

    notify(path: FieldPath) {
        let currentNode = this.#root;
        currentNode.subscribers.forEach(notifySub => notifySub());

        path.forEachNode(pathPart => {
            if (!currentNode) return;

            switch (pathPart.type) {
                case "property": {
                    currentNode = currentNode.propertyToNode[pathPart.name];
                }
            }
            if (currentNode) {
                currentNode.subscribers.forEach(notifySub => notifySub());
            }
        });
    }
}

function emptySubscriptionNode(): SubscriptionNode {
    return {
        propertyToNode: {},
        subscribers: []
    }
}

type SubscriptionNode = {
    propertyToNode: Record<string, SubscriptionNode>
    subscribers: Subscriber[]
}

export type Unsubscribe = () => void;
export type Subscriber = () => void;
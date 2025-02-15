export class FieldPath {
    #nodes: FieldNode[];

    constructor(nodes: FieldNode[]) {
        this.#nodes = nodes;
    }

    static create() {
        return new FieldPath([]);
    }

    withProperty(name: string): FieldPath {
        return new FieldPath([...this.#nodes, { type: "property", name }]);
    }

    toString(): string {
        return JSON.stringify(this.#nodes);
    }

    forEachNode(iterator: (node: FieldNode, meta: { isLast: boolean }) => void) {
        this.#nodes.forEach((node, i) => iterator(node, { isLast: i === this.#nodes.length - 1 }));
    }
}

export type FieldNode = {
    type: "property",
    name: string
}
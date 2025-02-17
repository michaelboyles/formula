export class FieldPath {
    readonly #nodes: FieldNode[];

    constructor(nodes: FieldNode[]) {
        this.#nodes = nodes;
    }

    static create() {
        return new FieldPath([]);
    }

    withProperty(name: string): FieldPath {
        const node: FieldNode = Object.freeze({ type: "property", name });
        return new FieldPath([...this.#nodes, node]);
    }

    withArrayIndex(index: number): FieldPath {
        const node: FieldNode = Object.freeze({ type: "index", index });
        return new FieldPath([...this.#nodes, node]);
    }

    toString(): string {
        let str = "<root>";
        for (const node of this.#nodes) {
            if (node.type === "property") {
                str += `.${node.name}`;
            }
            else if (node.type === "index") {
                str += `[${node.index}]`;
            }
        }
        return str;
    }

    getData(root: any): any {
        let data = root;
        for (const node of this.#nodes) {
            switch (node.type) {
                case "property": {
                    if (typeof data !== "object") {
                        throw new Error("Not an object")
                    }
                    data = data[node.name];
                    break;
                }
                case "index": {
                    if (!Array.isArray(data)) {
                        throw new Error("Not an array");
                    }
                    data = data[node.index];
                    break;
                }
            }
        }
        return data;
    }

    forEachNode(iterator: (node: FieldNode, meta: { isLast: boolean }) => void) {
        this.#nodes.forEach((node, i) => iterator(node, { isLast: i === this.#nodes.length - 1 }));
    }
}

export type FieldNode = {
    readonly type: "property",
    readonly name: string
} | {
    readonly type: "index"
    readonly index: number
}

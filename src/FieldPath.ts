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
        if (this.#nodes.length === 0) {
            return "<form-root>";
        }
        let str = "";
        for (const node of this.#nodes) {
            if (node.type === "property") {
                if (str.length) str += ".";
                str += node.name;
            }
            else if (node.type === "index") {
                str += `[${node.index}]`;
            }
        }
        return str;
    }

    getValue(root: any): any {
        let data = root;
        for (const node of this.#nodes) {
            data = FieldPath.#getValue(data, node)
        }
        return data;
    }

    static #getValue(data: any, node: FieldNode): any {
        switch (node.type) {
            case "property": {
                if (typeof data !== "object") {
                    throw new Error("Not an object")
                }
                return data[node.name];
            }
            case "index": {
                if (!Array.isArray(data)) {
                    throw new Error("Not an array");
                }
                return data[node.index];
            }
            default: {
                throw new Error(`Unknown node type ${node satisfies never}`);
            }
        }
    }

    // Produce a new copy of the given data, but with the value at the specified path. This will replace the objects
    // along the path with new values (i.e. changing an object property will produce a new object), but will not copy
    // elements in the tree which haven't changed.
    getDataWithValue(data: any, newValue: any): any {
        return this.#getDataWithValue(data, newValue, 0);
    }

    #getDataWithValue(data: any, newValue: any, nodeIdx: number): any {
        if (nodeIdx === this.#nodes.length) return newValue;
        const node = this.#nodes[nodeIdx];
        const newPart = this.#getDataWithValue(FieldPath.#getValue(data, node), newValue, nodeIdx + 1);

        if (node.type === "property") {
            return {...data, [node.name]: newPart};
        }
        else if (node.type === "index") {
            const arr: any[] = data;
            return [...data.slice(0, node.index), newPart, ...data.slice(node.index + 1, arr.length)];
        }
        throw new Error(`Unknown node type ${node satisfies never}`);
    }

    isRoot(): boolean {
        return this.#nodes.length === 0;
    }

    forEachNode(iterator: (node: FieldNode, meta: { isLast: boolean }) => void) {
        this.#nodes.forEach((node, i) => iterator(node, { isLast: i === this.#nodes.length - 1 }));
    }

    parts(): FieldNode[] {
        return this.#nodes;
    }
}

export type FieldNode = {
    readonly type: "property",
    readonly name: string
} | {
    readonly type: "index"
    readonly index: number
}

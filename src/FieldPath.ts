type Key = string | number | symbol;

export class FieldPath {
    readonly keys: ReadonlyArray<Key>;

    constructor(keys: Key[]) {
        this.keys = keys;
    }

    static create() {
        return new FieldPath([]);
    }

    equals(other: FieldPath): boolean {
        if (this.keys.length !== other.keys.length) return false;
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i] !== other.keys[i]) return false;
        }
        return true;
    }

    withProperty(key: string | number | symbol): FieldPath {
        return new FieldPath([...this.keys, key]);
    }

    toString(): string {
        if (this.keys.length === 0) {
            return "<form-root>";
        }
        let str = "";
        for (const key of this.keys) {
            if (str.length) str += ".";
            str += String(key);
        }
        return str;
    }

    getData(root: any): unknown {
        let data = root;
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            try {
                data = getPropertyOrIndex(data, key)
            }
            catch (e) {
                throw new Error(`${this.sliceTo(i).toString()} ${e}`)
            }
        }
        return data;
    }

    // Produce a new copy of the given data, but with the value at the specified path. This will replace the objects
    // along the path with new values (i.e. changing an object property will produce a new object), but will not copy
    // elements in the tree which haven't changed.
    getDataWithValue(data: any, newValue: any): any {
        return this._getDataWithValue(data, newValue, 0);
    }

    private _getDataWithValue(data: any, newValue: any, keyIdx: number): any {
        if (keyIdx === this.keys.length) return newValue;
        const key = this.keys[keyIdx];
        const newPart = this._getDataWithValue(getPropertyOrIndex(data, key), newValue, keyIdx + 1);

        if (Array.isArray(data)) {
            if (typeof key !== "number") {
                throw new Error("Cannot modify array with non-numeric key: " + key.toString());
            }
            return [...data.slice(0, key), newPart, ...data.slice(key + 1, data.length)];
        }
        else {
            return {...data, [key]: newPart};
        }
    }

    isRoot(): boolean {
        return this.keys.length === 0;
    }

    sliceTo(parts: number): FieldPath {
        if (parts > this.keys.length) {
            throw new Error(`Can't slice ${this.toString()} into ${parts} part(s)`)
        }
        return new FieldPath([...this.keys.slice(0, parts)]);
    }
}

function getPropertyOrIndex(data: any, key: Key): any {
    if (data == null) return undefined;
    if (typeof data !== "object") {
        throw "is not an object";
    }
    if (Array.isArray(data) && typeof key !== "number") {
        throw "is an array, not an object";
    }
    return data[key];
}

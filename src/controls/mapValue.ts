export type Mapper<In, Out> = (value: In) => Out;

// Wraps a possible Mapper in a function which checks that the result is string or number
export function stringNumberMapper<T>(delegate: ((value: T) => unknown) | undefined): Mapper<T, string | number> {
    if (delegate) {
        return wrapStringNumberMapper(delegate);
    }
    return value => {
        if (typeof value === "string") return value;
        return String(value);
    }
}

// Wraps a mapper and throws if the value is not a string or number
function wrapStringNumberMapper<T>(delegate: (value: T) => unknown): Mapper<T, string | number> {
    return value => {
        const mappedValue = delegate(value);
        const type = typeof mappedValue;
        if (type !== "string" && type !== "number") {
            throw new Error("Mapped value must be a string or number: " + mappedValue);
        }
        return mappedValue as string | number;
    }
}

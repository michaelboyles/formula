export type Mapper<T> = (value: T) => string | number;

// Wraps a possible Mapper in a function which checks that the result is string or number
export function createMapper<T>(delegate: ((value: T) => unknown) | undefined): Mapper<T> {
    if (delegate) {
        return safeMapper(delegate);
    }
    return safeMapper(value => String(value));
}

function safeMapper<T>(delegate: (value: T) => unknown): Mapper<T> {
    return value => {
        const mappedValue = delegate(value);
        const type = typeof mappedValue;
        if (type !== "string" && type !== "number") {
            throw new Error("Mapped value must be a string or number: " + mappedValue);
        }
        return mappedValue as string | number;
    }
}

export type Mapper<T> = (value: T) => string;

// Wraps a possible Mapper in a function which checks that the result is string or number
export function createMapper<T>(delegate: ((value: T) => unknown) | undefined): Mapper<T> {
    if (delegate) {
        return safeMapper(delegate);
    }
    return safeMapper(value => String(value));
}

function safeMapper<T>(delegate: (value: T) => unknown): Mapper<T> {
    return value => {
        const strValue = delegate(value);
        if (typeof strValue !== "string") {
            throw new Error("Value in Select must be a string: " + strValue);
        }
        return strValue;
    }
}

// tslint:disable: no-any

export const assert = (
    assertion: boolean,
    sentence?: string
): assertion is true => {
    if (!assertion) {
        throw new Error(`Failed assertion${sentence ? `: ${sentence}` : ""}`);
    }
    return true;
};

type PrimitiveTypeName =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
    | "null"
    | "any"
    | "Buffer";
type PrimitiveType<TypeName> = TypeName extends "string"
    ? string
    : TypeName extends "number"
    ? number
    : TypeName extends "bigint"
    ? bigint
    : TypeName extends "boolean"
    ? boolean
    : TypeName extends "symbol"
    ? symbol
    : TypeName extends "undefined"
    ? undefined
    : TypeName extends "object"
    ? object
    : TypeName extends "function"
    ? Function // tslint:disable-line: ban-types
    : TypeName extends "null"
    ? null
    : TypeName extends "any"
    ? any
    : TypeName extends "Buffer"
    ? Buffer
    : never;

const typeOf = (v: any): PrimitiveTypeName =>
    v === null ? "null" : Buffer.isBuffer(v) ? "Buffer" : typeof v;

export const assertTypeCheck = <T = any>(
    type: (t: any, key: string) => boolean,
    objects: {
        [value: string]: T;
    },
    typeDescription?: string
): objects is { [value: string]: T } => {
    for (const key of Object.keys(objects)) {
        const value = objects[key];
        if (!type(value, key)) {
            const readableType = Array.isArray(value) ? "any[]" : typeOf(value);
            throw new Error(
                typeDescription
                    ? `Expected ${key} to be of type '${typeDescription}', instead got '${readableType}'.`
                    : `${key} failed type assertion. Got type '${readableType}'.`
            );
        }
    }
    return true;
};

const is = (type: PrimitiveTypeName) => (v: any) =>
    type === "any" ? true : typeOf(v) === type;

const isUnionType = (unionType: string): string[] | false => {
    const types = unionType.split(" | ") as PrimitiveTypeName[];
    return types.length > 0 ? types : false;
};

const isArrayType = (arrayType: string): string | false => {
    const arrayMatch = arrayType.match(/^Array<(.*)>$/);
    const bracketMatch = arrayType.match(/^([^ ]*)\[\]$/);
    let type: string;
    if (arrayMatch) {
        [, type] = arrayMatch;
        return type;
    } else if (bracketMatch) {
        [, type] = bracketMatch;
        return type;
    }
    return false;
};

export const assertPrimitiveType = <T extends PrimitiveTypeName>(
    type: T,
    objects: {
        [value: string]: PrimitiveType<T>;
    }
): objects is { [value: string]: PrimitiveType<T> } =>
    assertTypeCheck(is(type), objects, type);

export const assertType = <T = any>(
    type: string,
    objects: {
        [value: string]: T;
    }
): objects is { [value: string]: T } => {
    if (isArrayType(type)) {
        // tslint:disable-next-line: no-use-before-declare
        return assertArray(
            type,
            (objects as unknown) as { [value: string]: T[] }
        );
    }
    if (isUnionType(type)) {
        // tslint:disable-next-line: no-use-before-declare
        return assertTypeUnion(type, objects);
    }

    return assertTypeCheck(is(type as PrimitiveTypeName), objects, type);
};

export const assertClass = <T extends new (...args: any) => any>(
    classType: T,
    objects: {
        [value: string]: InstanceType<T>;
    }
): objects is { [value: string]: InstanceType<T> } => {
    return assertTypeCheck(
        (v) => v instanceof classType,
        objects,
        classType.name
    );
};

export const assertBuffer = (objects: {
    [value: string]: Buffer;
}): objects is { [value: string]: Buffer } => {
    return assertType("Buffer", objects);
};

export const assertTypeUnion = <T = any>(
    unionType: string,
    objects: {
        [value: string]: T;
    }
): objects is { [value: string]: T } => {
    const types = unionType.split(" | ") as PrimitiveTypeName[];
    return assertTypeCheck(
        (v, key) =>
            types.reduce<boolean>((acc, type) => {
                if (acc) {
                    return acc;
                }
                if (isArrayType(type)) {
                    try {
                        // tslint:disable-next-line: no-use-before-declare
                        assertArray(type, { [key]: v });
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
                return is(type)(v);
            }, false),
        objects,
        unionType
    );
};

export const assertArray = <T = any>(
    arrayType: string,
    objects: {
        [value: string]: T[];
    }
): objects is { [value: string]: T[] } => {
    const type = isArrayType(arrayType);
    if (!type) {
        throw new Error(`Invalid array type ${arrayType}`);
    }

    for (const key of Object.keys(objects)) {
        if (!key) {
            return false;
        }
        const value = objects[key];
        assertTypeCheck((v: any) => Array.isArray(v), { value }, "any[]");

        for (let i = 0; i < value.length; i++) {
            assertTypeUnion(type, { [`${key}[${i}]`]: value[i] });
        }
    }
    return true;
};
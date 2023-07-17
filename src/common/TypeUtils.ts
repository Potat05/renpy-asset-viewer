


export namespace TypeUtils {


    
    type Shift<A extends Array<any>> = 
        ((...args: A) => void) extends ((...args: [A[0], ...infer R]) => void) ? R : never;

    type GrowExpRev<A extends any[], N extends number, P extends any[][]> = 
        A['length'] extends N ? A : [...A, ...P[0]][N] extends undefined ? GrowExpRev<[...A, ...P[0]], N, P> : GrowExpRev<A, N, Shift<P>>;

    type GrowExp<A extends any[], N extends number, P extends any[][], L extends number = A['length']> = 
        L extends N ? A : L extends 8192 ? any[] : [...A, ...A][N] extends undefined ? GrowExp<[...A, ...A], N, [A, ...P]> : GrowExpRev<A, N, P>;

    type MapItemType<T, I> = { [K in keyof T]: I };

    /** @see https://stackoverflow.com/questions/41139763/how-to-declare-a-fixed-length-array-in-typescript#:~:text=We%20can%20write%20it%2C%20including%20safe%20guard%20at%20size%20of%208192%2C%20as%20below%3A */
    export type FixedLengthArray<T, N extends number> = 
        N extends 0 ? [] : MapItemType<GrowExp<[0], N, []>, T>;

    

    export type PopArguments<T extends unknown[]> =
        T extends [ ...infer Head, unknown ]
        ? Head
        : [];

    export type ShiftArguments<T extends unknown[]> =
        T extends [ unknown, ...infer Tail ]
        ? Tail
        : [];


    
}



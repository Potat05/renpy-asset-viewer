import { NumberUtils } from "./NumberUtils";
import type { TypeUtils } from "./TypeUtils";



type SmallNumberType = "Uint8" | "Uint16" | "Uint32" | "Int8" | "Int16" | "Int32" | "Float32" | "Float64";
type BigNumberType = "BigUint64" | "BigInt64";
const NumSizes = {
    Uint8: 1,
    Int8: 1,
    Uint16: 2,
    Int16: 2,
    Uint32: 4,
    Int32: 4,
    BigUint64: 8,
    BigInt64: 8,
    Float32: 4,
    Float64: 8
}



type TextEncodings = 'ascii' | 'utf-8';



type ReaderCallbackFunctionType<T extends DataReader> = ((this: T, ...args: any[]) => any);



/**
 * Base DataReader class.  
 * Meant to be extended to add new types.  
 *   
 * Base DataReader includes reader types: number, string, array  
 */
class DataReader {

    public view: DataView = new DataView(new ArrayBuffer(0));
    public pointer: number = 0;
    public get length(): number {
        return this.view.byteLength;
    }
    public get buffer(): ArrayBuffer {
        return this.view.buffer;
    }
    public get eof(): boolean {
        return this.pointer >= this.length;
    }
    public get dataLeft(): number {
        return this.length - this.pointer;
    }

    public loadData(data: ArrayBuffer | { buffer: ArrayBuffer }, pointer: number = 0) {
        if(!(data instanceof ArrayBuffer)) {
            data = data.buffer;
        }
        this.view = new DataView(data);
        this.pointer = pointer;
    }

    /**
     * Move data to a different reader class.  
     */
    to<T extends DataReader>(reader: T): T;
    to<T extends typeof DataReader>(reader: T): InstanceType<T>;
    to() {
        let reader = arguments[0];
        if(typeof reader == 'function') {
            reader = new reader();
        }

        reader.loadData(this.buffer, this.pointer);
        return reader;
    }

    constructor(data?: ArrayBuffer | DataReader) {
        
        if(data !== undefined) {

            if(data instanceof DataReader) {
                data = data.buffer;
            }

            this.loadData(data);

        }

    }



    /**
     * Peek a value at offset.  
     */
    peek<F extends ((...args: any[]) => any)>(readFunc: F, offset: number = 0, ...args: Parameters<F>): ReturnType<F> {
        const pointer = this.pointer;
        this.pointer += offset;
        const value: ReturnType<F> = readFunc.call(this, ...args);
        this.pointer = pointer;
        return value;
    }



    /**
     * Get a buffer of a secion of the data.  
     */
    readBuffer(length: number): ArrayBuffer {
        const buffer = this.buffer.slice(this.pointer, this.pointer + length);
        this.pointer += length;
        return buffer;
    }

    /**
     * Read buffer fast.  
     * Only use this if you aren't using .buffer  
     */
    readBufferFast(length: number): Uint8Array {
        const buffer = new Uint8Array(this.buffer, this.pointer, length);
        this.pointer += length;
        return buffer;
    }



    static BIG_ENDIAN = false;
    static LITTLE_ENDIAN = true;
    endianness: boolean = DataReader.LITTLE_ENDIAN;

    /**
     * Read number data type.  
     */
    readNumber(type: SmallNumberType): number {
        const num: number = this.view[`get${type}`](this.pointer, this.endianness);
        this.pointer += NumSizes[type];
        return num;
    }

    /**
     * Read big number.  
     * I would just put this in readNumber but typescript is poopy  
     * and breaks when you do readArray(readNumber)  
     */
    readBigNumber(type: BigNumberType): bigint {
        const num: bigint = this.view[`get${type}`](this.pointer, this.endianness);
        this.pointer += NumSizes[type];
        return num;
    }

    /**
     * Read custom number with n amount of bytes, and signed if needed.
     * @param bytes 
     * @param signed 
     * @returns 
     * 
     * @todo Test if this actually behaves as expected. (I've only tested it with little endian and signed.)
     */
    readCustomNumber(bytes: number, signed: boolean): number {

        let arr = new Uint8Array(this.readBuffer(bytes));
        if(this.endianness == DataReader.LITTLE_ENDIAN) {
            arr = arr.reverse();
        }

        let value = 0;
        for(let i = 0; i < arr.length; i++) {
            value <<= 8;
            value |= arr[i];
        }

        if(!signed) {

            return value;

        } else {

            // If last bit is set, value is negative.
            if(value & (2 << (bytes * 8 - 1))) {
                value &= (2 << (bytes * 8 - 1)) - 1;
                value = -value;
            }

            return value;
            
        }

    }

    /**
     * Read big custom number with n amount of bytes, and signed if needed.
     * @param bytes 
     * @param signed 
     * @returns 
     * 
     * @todo Test if this actually behaves as expected. (I've only tested it with little endian and signed.)
     */
    readBigCustomNumber(bytes: number, signed: boolean): bigint {
        
        let arr = new Uint8Array(this.readBuffer(bytes));
        if(this.endianness == DataReader.LITTLE_ENDIAN) {
            arr = arr.reverse();
        }

        let value = 0n;
        for(let i = 0; i < arr.length; i++) {
            value <<= 8n;
            value |= BigInt(arr[i]);
        }

        if(!signed) {

            return value;

        } else {

            // If last bit is set, value is negative.
            if(value & (2n << (BigInt(bytes) * 8n - 1n))) {
                value &= (2n << (BigInt(bytes) * 8n - 1n)) - 1n;
                value = -value;
            }

            return value;
            
        }

    }


    /**
     * Read string of length.  
     */
    readString(length: number, encoding: TextEncodings = 'utf-8'): string {
        const encoded = this.readBuffer(length);

        const decoded = new TextDecoder(encoding).decode(encoded);
        return decoded;
    }

    /**
     * Read string ending in null character "\x00".  
     * Null character is not included in final string.  
     */
    readNullString(encoding: TextEncodings = 'utf-8'): string {
        let peek: number = this.pointer;
        // ascii is only 1 byte each character.
        // utf-8 may be multiple bytes per character.
        // This doesn't cause any problems though as utf-8 specifications states that
        // null byte cant be used inside a character except for a null character.
        while(this.view.getUint8(peek++) != 0x00);

        // const encoded = this.buffer.slice(this.pointer, peek - 1); // ~100ms
        const encoded = this.readBufferFast(peek - this.pointer - 1); // ~10ms
        this.pointer++;

        const decoded = new TextDecoder(encoding).decode(encoded);
        return decoded;
    }



    /**
     * Read an array of types.  
     */
    readArray<F extends ReaderCallbackFunctionType<this>>(readFunc: F, count: number, ...args: Parameters<F>): ReturnType<F>[] {
        let arr: ReturnType<F>[] = new Array(count);
        for(let i=0; i < count; i++) {
            arr[i] = readFunc.call(this, ...args);
        }
        return arr;
    }

    /**
     * Read an array while true.  
     */
    readArrayWhile<F extends ReaderCallbackFunctionType<this>>(readFunc: F, whileFunc: (current: ReturnType<F>, index: number, arr: ReturnType<F>[]) => boolean, ...args: Parameters<F>): ReturnType<F>[] {
        let arr: ReturnType<F>[] = new Array();
        do {
            arr.push(readFunc.call(this, ...args));
        } while(whileFunc(arr[arr.length-1], arr.length-1, arr));
        return arr;
    }

    /**
     * Read an array of types.  
     * Read type tuple for better typings.  
     */
    readArrayTuple<F extends ReaderCallbackFunctionType<this>, L extends number>(readFunc: F, count: L, ...args: Parameters<F>): TypeUtils.FixedLengthArray<ReturnType<F>, L> {
        // @ts-ignore
        return this.readArray(readFunc, count, ...args);
    }

    /**
     * Read until end of data.  
     */
    readArrayUntilEnd<F extends ReaderCallbackFunctionType<this>>(readFunc: F, ...args: Parameters<F>): ReturnType<F>[] {
        return this.readArrayWhile(readFunc, () => !this.eof, ...args);
    }



    /**
     * Throws an error if magic doesn't match.  
     */
    assertMagic(magic: string): void;
    assertMagic(magic: ArrayBuffer): void;
    assertMagic(magic: Array<number>): void;
    assertMagic(magic: number, type: SmallNumberType): void;
    assertMagic(magic: bigint, type: BigNumberType): void;
    assertMagic(magic: string | ArrayBuffer | Array<number> | number | bigint, type?: SmallNumberType | BigNumberType): void {

        if(typeof magic == 'string') {

            const string = this.readString(magic.length, 'ascii');

            if(string != magic) {
                throw new Error(`DataReader.assertMagic: Strings do not match. expected: "${magic}" got: "${string}"`);
            }

        } else if(magic instanceof ArrayBuffer) {

            const magicBuffer = new Uint8Array(magic);

            const buffer = new Uint8Array(this.readBuffer(magicBuffer.length));

            if(magicBuffer.some((v, i) => v != buffer[i])) {
                throw new Error('DataReader.assertMagic: Buffers do not match.');
            }

        } else if(Array.isArray(magic)) {

            const buffer = new Uint8Array(this.readBuffer(magic.length));

            if(magic.some((v, i) => v != buffer[i])) {
                throw new Error('DataReader.assertMagic: Arrays do not match.');
            }

        } else if(typeof magic == 'number' || typeof magic == 'bigint') {

            if(type === undefined) throw new Error('DataReader.magic: Must provide type for number.');

            const value = typeof magic == 'number' ? this.readNumber(type as SmallNumberType) : this.readBigNumber(type as BigNumberType);

            if(value != magic) {
                throw new Error(`DataReader.assertMagic: Magic number does not match. expected: ${NumberUtils.hex(magic, NumSizes[type])} got: ${NumberUtils.hex(value, NumSizes[type])}`);
            }

        } else {

            throw new Error('DataReader.assertMagic: Invalid arguments.');

        }

    }


    /**
     * Returns false is magic doesn't match.  
     */
    magic(...args: Parameters<DataReader['assertMagic']>): boolean {
        try {
            this.assertMagic(...args);
            return true;
        } catch(err) {
            return false;
        }
    }



    // // Should not be used.
    // /** Forces whatever data type to be set size. */
    // pad<F extends ReaderCallbackFunctionType<this>>(length: number, readFunc: F, ...args: Parameters<F>): ReturnType<F>;
    // pad(length: number): void;
    // pad(length: number, readFunc?: Function, ...args: any[]): any {
    //     if(readFunc === undefined) {
    //         this.pointer += length;
    //         return;
    //     }

    //     const start = this.pointer;
    //     const data = readFunc.call(this, ...args);
    //     this.pointer = start + length;
    //     return data;
    // }

}



export { DataReader };
export type { ReaderCallbackFunctionType };

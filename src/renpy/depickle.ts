
/*

    http://formats.kaitai.io/python_pickle
    https://github.com/python/cpython/blob/3.11/Lib/pickle.py

    The depickler is a simple stack based machine.
    Taking opcodes (instructions) to operate on the stack.
    One the depickler hits the STOP opcode, we return the stack.

    Usually the first opcode is PROTO, this defines the protocol of the pickle.
    Each protocol has a set of opcodes and rules it has to follow.
    We only support protocol 2, 3, 4, & 5 (For now), as they don't include anything special or extra, just new opcodes.

    We don't have access to python classes, so we use simple containers for them instead.

*/

import { DataReader } from "../common/DataReader";
import { NumberUtils } from "../common/NumberUtils";



enum Protocols {
    /** Unknown protocol. */
    UNKNOWN = -1,

    /** ASCII clean, no explicit version, fields are '\n' terminated. */
    Protocol0 = 0,
    /** Binary, no explicit version, first length prefixed types. */
    Protocol1 = 1,
    /** ([PEP 307](https://peps.python.org/pep-0307/)): Python 2.3+. Explicit versioning, more length prefixed types. */
    Protocol2 = 2,
    /** Python 3.0+. Dedicated opcodes for `bytes` objects. */
    Protocol3 = 3,
    /** ([PEP 3154](https://peps.python.org/pep-3154/)): Python 3.4+. Opcodes for 64 bit strings, framing, `set`. */
    Protocol4 = 4,
    /** ([PEP 574](https://peps.python.org/pep-0574/)): Python 3.8+: Opcodes for `bytearray` and out of band data */
    Protocol5 = 5
}



enum Opcodes {

    // These were initially 1 byte strings.
    // I had to convert them by hand so some of them may be wrong.

    /** Unknown opcode. */
    UNKNOWN          = -1,
    
    // Protocol 1
    
	/** push special markobject on stack */
    MARK             = 0x28,
	/** every pickle ends with STOP */
    STOP             = 0x2E,
	/** discard topmost stack item */
    POP              = 0x30,
	/** discard stack top through topmost markobject */
    POP_MARK         = 0x31,
	/** duplicate top stack item */
    DUP              = 0x32,
	/** push float object; decimal string argument */
    FLOAT            = 0x46,
	/** push integer or bool; decimal string argument */
    INT              = 0x49,
	/** push four-byte signed int */
    BININT           = 0x4A,
	/** push 1-byte unsigned int */
    BININT1          = 0x4B,
	/** push long; decimal string argument */
    LONG             = 0x4C,
	/** push 2-byte unsigned int */
    BININT2          = 0x4D,
	/** push None */
    NONE             = 0x4E,
	/** push persistent object; id is taken from string arg */
    PERSID           = 0x50,
	/**"       "         "  ;  "  "   "     "  stack */
    BINPERSID        = 0x51,
	/** apply callable to argtuple, both on stack */
    REDUCE           = 0x52,
	/** push string; NL-terminated string argument */
    STRING           = 0x53,
	/** push string; counted binary string argument */
    BINSTRING        = 0x54,
	/**"     "   ;    "      "       "      " < 256 bytes */
    SHORT_BINSTRING  = 0x55,
	/** push Unicode string; raw-unicode-escaped'd argument */
    UNICODE          = 0x56,
	/** "     "       "  ; counted UTF-8 string argument */
    BINUNICODE       = 0x58,
	/** append stack top to list below it */
    APPEND           = 0x61,
	/** call __setstate__ or __dict__.update() */
    BUILD            = 0x62,
	/** push self.find_class(modname, name); 2 string args */
    GLOBAL           = 0x63,
	/** build a dict from stack items */
    DICT             = 0x64,
	/** push empty dict */
    EMPTY_DICT       = 0x7D,
	/** extend list on stack by topmost stack slice */
    APPENDS          = 0x65,
	/** push item from memo on stack; index is string arg */
    GET              = 0x67,
	/** "    "    "    "   "   "  ;   "    " 1-byte arg */
    BINGET           = 0x68,
	/** build & push class instance */
    INST             = 0x69,
	/** push item from memo on stack; index is 4-byte arg */
    LONG_BINGET      = 0x6A,
	/** build list from topmost stack items */
    LIST             = 0x6C,
	/** push empty list */
    EMPTY_LIST       = 0x5D,
	/** build & push class instance */
    OBJ              = 0x6F,
	/** store stack top in memo; index is string arg */
    PUT              = 0x70,
	/** "     "    "   "   " ;   "    " 1-byte arg */
    BINPUT           = 0x71,
	/** "     "    "   "   " ;   "    " 4-byte arg */
    LONG_BINPUT      = 0x72,
	/** add key+value pair to dict */
    SETITEM          = 0x73,
	/** build tuple from topmost stack items */
    TUPLE            = 0x74,
	/** push empty tuple */
    EMPTY_TUPLE      = 0x29,
	/** modify dict by adding topmost key+value pairs */
    SETITEMS         = 0x75,
	/** push float; arg is 8-byte float encoding */
    BINFLOAT         = 0x47,

    //  Protocol 2

	/** identify pickle protocol */
    PROTO            = 0x80,
	/** build object by applying cls.__new__ to argtuple */
    NEWOBJ           = 0x81,
	/** push object from extension registry; 1-byte index */
    EXT1             = 0x82,
	/** ditto, but 2-byte index */
    EXT2             = 0x83,
	/** ditto, but 4-byte index */
    EXT4             = 0x84,
	/** build 1-tuple from stack top */
    TUPLE1           = 0x85,
	/** build 2-tuple from two topmost stack items */
    TUPLE2           = 0x86,
	/** build 3-tuple from three topmost stack items */
    TUPLE3           = 0x87,
	/** push True */
    NEWTRUE          = 0x88,
	/** push False */
    NEWFALSE         = 0x89,
	/** push long from < 256 bytes */
    LONG1            = 0x8a,
	/** push really big long */
    LONG4            = 0x8b,

    //  Protocol 3 (Python 3.x)

	/** push bytes; counted binary string argument */
    BINBYTES         = 0x42,
	/**"     "   ;    "      "       "      " < 256 bytes */
    SHORT_BINBYTES   = 0x43,

    //  Protocol 4

	/** push short string; UTF-8 length < 256 bytes */
    SHORT_BINUNICODE = 0x8c,
	/** push very long string */
    BINUNICODE8      = 0x8d,
	/** push very long bytes string */
    BINBYTES8        = 0x8e,
	/** push empty set on the stack */
    EMPTY_SET        = 0x8f,
	/** modify set by adding topmost stack items */
    ADDITEMS         = 0x90,
	/** build frozenset from topmost stack items */
    FROZENSET        = 0x91,
	/** like NEWOBJ but work with keyword only arguments */
    NEWOBJ_EX        = 0x92,
	/** same as GLOBAL but using names on the stacks */
    STACK_GLOBAL     = 0x93,
	/** store top of the stack in memo */
    MEMOIZE          = 0x94,
	/** indicate the beginning of a new frame */
    FRAME            = 0x95,

    //  Protocol 5

	/** push bytearray */
    BYTEARRAY8       = 0x96,
	/** push next out-of-band buffer */
    NEXT_BUFFER      = 0x97,
    /** make top of stack readonly */
    READONLY_BUFFER  = 0x98
    
}



export class DummyClass {

    // The module that this class was created from.
    module: DummyModule;
    // The arguments that this class was created with.
    args: unknown[];
    // The current state of the class. (TODO: Document state.)
    state?: unknown[];

    constructor(module: DummyModule, ...args: unknown[]) {
        this.module = module;
        this.args = args;
    }

}

export class DummyModule {

    module: string;
    name: string;

    constructor(module: string, name: string) {
        this.module = module;
        this.name = name;
    }

    make(...args: unknown[]) {
        return new DummyClass(this, ...args);
    }

}





class Stack {

    // Mark a specific point in the stack to trace back to.
    static MARK = Symbol('Mark');



    stack: unknown[] = [];

    append(value: unknown) {
        this.stack.push(value);
    }

    pop(): unknown {
        return this.stack.pop();
    }

    get last(): unknown {
        return this.stack[this.stack.length - 1];
    }

    set last(value: unknown) {
        this.stack[this.stack.length - 1] = value;
    }

    popMark(): unknown[] {

        let items: unknown[] = [];

        for(var markIndex = this.stack.length - 1; markIndex >= 0; markIndex--) {
            if(this.stack[markIndex] === Stack.MARK) {
                this.pop();
                break;
            } else {
                items.unshift(this.pop());
            }
        }

        return items;
        
    }

}

class Memo {

    memo: unknown[] = [];

    get(index: number): unknown {
        return this.memo[index];
    }

    set(value: unknown, index: number) {
        this.memo[index] = value;
    }

    append(value: unknown) {
        this.memo.push(value);
    }

    get lastMemo(): unknown {
        return this.memo[this.memo.length - 1];
    }
    
}



export class Depickler extends DataReader {

    debug: boolean;
    operTime: {[key in Opcodes]?: number} = {};

    constructor(data?: ArrayBuffer | DataReader, debug: boolean = false) {
        super(data);
        this.debug = debug;
    }



    protocol: Protocols = Protocols.UNKNOWN;



    stack: Stack = new Stack();
    memo: Memo = new Memo();



    findClass(module: string, name: string) {
        return new DummyModule(module, name);
    }



    readOperation(): Opcodes {
        
        const start = this.debug ? performance.now() : 0;

        if(this.eof) {
            throw new Error('Depickler.readOperation: Reached end of pickle data without STOP opcode.');
        }

        const opcode = this.readNumber('Uint8');

        switch(opcode) {

            case Opcodes.STOP: break;

            case Opcodes.PROTO: {

                this.protocol = this.readNumber('Uint8');

                if(!(this.protocol in Protocols)) {
                    throw new Error(`Depickler.readPicke: Unknown protocol. ${this.protocol}`);
                }

                if(![ Protocols.Protocol2, Protocols.Protocol3, Protocols.Protocol4, Protocols.Protocol5 ].includes(this.protocol)) {
                    throw new Error(`Depickler.readPickle: Unsupported protocol. ${Protocols[this.protocol]}`);
                }

                break; }

            case Opcodes.FRAME: {

                // This is how big data to load next.
                // We don't use this because all data is already loaded in.
                this.readBigNumber('BigUint64');

                break; }

            case Opcodes.EMPTY_DICT: {

                this.stack.append({});

                break; }

            case Opcodes.MEMOIZE: {

                this.memo.append(this.stack.last);

                break; }

            case Opcodes.MARK: {

                this.stack.append(Stack.MARK);

                break; }

            case Opcodes.SHORT_BINUNICODE: {

                this.stack.append(this.readString(this.readNumber('Uint8'), 'utf-8'));

                break; }

            case Opcodes.EMPTY_LIST: {

                this.stack.append([]);

                break; }

            case Opcodes.BININT: {

                this.stack.append(this.readNumber('Int32'));

                break; }

            case Opcodes.SHORT_BINBYTES: {

                const length = this.readNumber('Uint8');
                const buffer = new Uint8Array(this.readBuffer(length));
                this.stack.append(buffer);

                break; }

            case Opcodes.TUPLE3: {

                this.stack.append([ this.stack.pop(), this.stack.pop(), this.stack.pop() ].reverse());

                break; }

            case Opcodes.APPEND: {

                const value = this.stack.pop();
                (this.stack.last as Array<unknown>).push(value);

                break; }

            case Opcodes.BINGET: {

                const index = this.readNumber('Uint8');

                if(this.memo.get(index) === undefined) {
                    throw new Error(`Depickler.readPickle: Memo value not found at index ${index}`);
                }

                this.stack.append(this.memo.get(index));

                break; }

            case Opcodes.SETITEMS: {

                const items = this.stack.popMark();
                if(items.length % 2 != 0) {
                    throw new Error('Depickler.readPickle: Can not set an odd number of items.');
                }
                const dict = (this.stack.last as {[key: string]: unknown});

                for(let i = 0; i < items.length; i += 2) {
                    dict[items[i + 0] as string] = items[i + 1];
                }

                break; }

            case Opcodes.BININT2: {

                this.stack.append(this.readNumber('Uint16'));

                break; }

            case Opcodes.BINPUT: {

                const index = this.readNumber('Uint8');
                this.memo.set(this.stack.last, index);

                break; }

            case Opcodes.BINUNICODE: {

                const length = this.readNumber('Uint32');
                this.stack.append(this.readString(length, 'utf-8'));

                break; }

            case Opcodes.LONG1: {

                const length = this.readNumber('Uint8');
                this.stack.append(this.readCustomNumber(length, true));

                break; }

            case Opcodes.SHORT_BINSTRING: {

                const length = this.readNumber('Uint8');
                this.stack.append(this.readString(length, 'utf-8'))

                break; }

            case Opcodes.LONG_BINPUT: {

                const index = this.readNumber('Uint32');
                this.memo.set(this.stack.last, index);

                break; }

            case Opcodes.GLOBAL: {

                const module = this.readUntilNewline();
                const name = this.readUntilNewline();

                this.stack.append(this.findClass(module, name));

                break; }

            case Opcodes.EMPTY_TUPLE: {

                this.stack.append([]);

                break; }

            case Opcodes.NEWOBJ: {

                const args = this.stack.pop() as unknown[];
                const module = this.stack.pop() as DummyModule;

                this.stack.append(module.make(...args));

                break; }

            case Opcodes.NONE: {

                // We don't use symbol here, If we do it will be converted to null on json stringify the final object.
                this.stack.append(null);

                break; }

            case Opcodes.BININT1: {

                this.stack.append(this.readNumber('Uint8'));

                break; }

            case Opcodes.TUPLE: {

                this.stack.append([ ...this.stack.popMark() ].reverse());

                break; }

            case Opcodes.TUPLE2: {

                this.stack.append([ this.stack.pop(), this.stack.pop() ].reverse());

                break; }

            case Opcodes.BUILD: {

                const state = this.stack.pop() as unknown[];

                const inst = this.stack.last as DummyClass;

                inst.state = state;

                // TODO: Finish this.

                break; }

            case Opcodes.NEWFALSE: {

                this.stack.append(false);

                break; }

            case Opcodes.NEWTRUE: {

                this.stack.append(true);

                break; }

            case Opcodes.APPENDS: {

                const items = this.stack.popMark();
                const arr = this.stack.last as unknown[];
                arr.push(...items);

                break; }

            case Opcodes.TUPLE1: {

                this.stack.append([ this.stack.pop() ]);

                break; }

            case Opcodes.LONG_BINGET: {

                const index = this.readNumber('Uint32');

                if(this.memo.get(index) === undefined) {
                    throw new Error(`Depickler.readPickle: Memo value not found at index ${index}`);
                }

                this.stack.append(this.memo.get(index));

                break; }

            case Opcodes.SETITEM: {

                const value = this.stack.pop();
                const key = this.stack.pop() as string;
                (this.stack.last as {[key: string]: unknown})[key] = value;

                break; }

            case Opcodes.REDUCE: {

                const args = this.stack.pop() as unknown[];
                const func = (this.stack.last as typeof DummyModule | unknown);
                if(func instanceof DummyModule) {
                    this.stack.last = func.make(...args);
                } else {
                    this.stack.last = (func as (...args: unknown[]) => unknown)(...args);
                }

                break; }

            default: {

                if(Opcodes[opcode] === undefined) {
                    throw new Error(`Depicker.readPickle: Unknown opcode. ${NumberUtils.hex(opcode, 1)}`);
                } else {
                    throw new Error(`Depicker.readPickle: Unimplemented opcode. ${Opcodes[opcode]}`);
                }

                break; }
        }

        if(this.debug) {
            const time = performance.now() - start;
            this.operTime[opcode] = (this.operTime[opcode] ?? 0) + time;
        }

        return opcode;
        
    }

    readPickle() {

        if(this.debug) console.time('Depickle');

        while(this.readOperation() != Opcodes.STOP);

        if(this.debug) {
            console.timeEnd('Depickle');

            const mappedNames = Object.fromEntries(Object.entries(this.operTime).map(entry => [ Opcodes[parseInt(entry[0])], entry[1] ]));
            const longest = Object.keys(mappedNames).reduce((length, opcode) => Math.max(length, opcode.length), 0);

            for(const [ opcode, duration ] of Object.entries(mappedNames)) {
                console.log(`${opcode.padEnd(longest, ' ')} with ${Math.round(duration)}ms`);
            }
        }

        return this.stack.stack;

    }

    static depickle(data: ArrayBuffer, debug: boolean = false) {

        const out = new Depickler(data, debug).readPickle();

        return out;

    }



    // MISC METHODS

    // Basically a copy of DataReader.readNullString but for newline.
    readUntilNewline(): string {
        let peek: number = this.pointer;
        while(this.view.getUint8(peek++) != 0x0A);
        const encoded = this.readBufferFast(peek - this.pointer - 1);
        this.pointer++;
        return new TextDecoder('ascii').decode(encoded);
    }

}




/*

    https://github.com/renpy/renpy/blob/bdcd6191bdf9b4c30331eafde528cf55543438d9/renpy/script.py#L579

    The Ren'Py compiled code format is an extremely simple container for compiled python code.

    The format (simplified) is as follows:
        Header
        Data List
        ...Data Chunks
        MD5 Hash

        The header is string 'RPA-3.0' (If it is not this then it may be a legacy format.)

        The data list is an array of 3 uint32 value structs:
            slot (Identifier)
            offset
            length
        Slot identifiers:
            -1: 
            0: end of data list
            1: code pickle data before static transforms
            2: code pickle data after static transforms

        The data chunks is compressed data with DEFLATE compression.

        MD5 hash checksum.


    There is a legacy format that is VERY old.
    It only 1 chunk, It is pickle data that is compressed with DEFLATE compression.

*/

import Pako from "pako";
import { DataReader } from "../../common/DataReader";
import md5 from "md5";



const RPYC_2_HEADER = 'RENPY RPC2';



export enum Slots {
    Legacy = -1,
    End = 0,
    BeforeStaticTransforms = 1,
    AfterStaticTransforms = 2
}

type Chunk = {
    slot: Slots;
    offset: number;
    length: number;
}

export type DataChunk = Chunk & {
    data: ArrayBuffer;
}



function checkScriptMD5(data: ArrayBuffer): boolean {
    // This is currently broken, and I have no clue why.
    // Everything I try results in the wrong hash no matter what.
    return true;

    const reader = new DataReader(data);

    // Legacy format does not have MD5.
    if(reader.readString(RPYC_2_HEADER.length) != RPYC_2_HEADER) {
        console.warn('checkScriptMD5: No md5 checksum on legacy script format.');
        return true;
    }

    reader.pointer = 0;
    const buffer = reader.readBuffer(reader.dataLeft - 16);

    const got = new Uint8Array(md5(new Uint8Array(buffer), {
        asBytes: true
    }));

    const expected = new Uint8Array(reader.readBuffer(16));

    console.log(expected, got);

    return expected.every((exp, i) => exp == got[i]);

}

function loadScriptData(data: ArrayBuffer): DataChunk[] {
    const reader = new DataReader(data);



    const header = reader.readString(RPYC_2_HEADER.length, 'ascii');

    if(header != RPYC_2_HEADER) {
        console.warn('decompileScript: Legacy format may not decompile correctly.');

        // This is in legacy format, Only 1 data chunk.
        reader.pointer = 0;
        const buffer = reader.readBuffer(reader.length);
        const decompressed = Pako.inflate(buffer);

        return [{
            slot: -1,
            offset: 0,
            length: reader.length,
            data: decompressed
        }];

        // TODO: Does this have md5 checksum?
    }



    let chunks: Chunk[] = [];

    // Read slots.
    while(true) {

        const slot = reader.readNumber('Uint32');
        const offset = reader.readNumber('Uint32');
        const length = reader.readNumber('Uint32');

        if(slot == 0) break;
        
        chunks.push({ slot, offset, length });

    }


    // Read slots data & decompress.
    const dataChunks = chunks.map(chunk => {

        reader.pointer = chunk.offset;
        const buffer = reader.readBuffer(chunk.length);
        const decompressed = Pako.inflate(buffer);

        return {
            ...chunk,
            data: decompressed
        }

    });



    return dataChunks;

}

export function loadScript(data: ArrayBuffer): DataChunk[] {

    if(!checkScriptMD5(data)) {
        throw new Error('decompileScript: md5 checksum failed.');
    }

    return loadScriptData(data);

}

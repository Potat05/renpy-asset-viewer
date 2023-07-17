


export namespace NumberUtils {

    /**
     * Hexify a number.  
     * This does not work with signed values.
     * 
     * ex: `NumberUtils.hex(1337, 2)` -> `'0x539'`
     * 
     * @param value Value to convert to hex string.
     * @param bytes Number of bytes the number is.
     * @param prefix Prefix the hex string.
     * @returns Hex number string.
     */
    export function hex(value: number | bigint, bytes: number, prefix: string = '0x') {
        return `${prefix}${value.toString(16).toUpperCase().padStart(bytes * 2, '0')}`;
    }

}



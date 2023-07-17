


export namespace ObjectUtils {

    export function dumpStrings(obj: object, strings: Set<string> = new Set(), alreadyCalled: Set<object> = new Set()): Set<string> {

        if(alreadyCalled.has(obj)) return strings;
        alreadyCalled.add(obj);

        for(const key in obj) {
            // @ts-ignore
            const value = obj[key];

            if(typeof value == 'string') {
                strings.add(value);
            } else if(typeof value == 'object' && value !== null) {
                dumpStrings(value, strings, alreadyCalled);
            }
        }

        return strings;

    }

}



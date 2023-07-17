
/*

    The compiled code is basically just an AST (Abstract Syntax Tree)
    Yep. So decompiling is pretty easy, but ALOT of random nodes need to program for.

    TODO: Replace nulls with unknown.

    TODO: This isn't really decompiling, It's more like prettyprinting instead.
    So maybe this should just be refactored to not used the word compiled but instead prettyprint, But IDK.

*/

import { parseRenPyClass } from "./decompile_renpy";
import { parseRenPyATLClass } from "./decompile_renpy_atl";
import { parseRenPySL2Class } from "./decompile_renpy_sl2";
import { Slots, type DataChunk } from "./load";



export type CompiledScriptHeader = {
    version: number;
    key: 'unlocked' | string;
}

export type CompiledModule = {
    module: string;
    name: string;
}

export type CompiledClass = {
    module: CompiledModule;
    args: unknown[];
    state: unknown;
}

type CompiledScript = [
    CompiledScriptHeader,
    CompiledClass[]
];



export enum ModuleNames {
    RenPy = 'renpy.ast',
    RenPy_SL2 = 'renpy.sl2.slast',
    RenPy_ATL = 'renpy.atl'
}



export function removeMultipleNewlines(str: string): string {
    str = str.replaceAll('\n\n\n', '\n');
    str = str.replaceAll('\n\n\n', '\n');
    str = str.replaceAll('\n\n\n', '\n');
    return str;
}

const indentationStr = '    ';

export function indent(str: string, indentation: number = 1): string {
    const indentStr = indentationStr.repeat(indentation);
    return str.split('\n').map(s => `${indentStr}${s}`).join('\n');
}



// Debug mode, print out last couple of classes on error.
const DEBUG: boolean = true;
const DEBUG_COUNT: number = 100;
let classStack: CompiledClass[] = [];



function parseClassInner(_class: CompiledClass): string {
    
    const module = _class.module;

    switch(module.module) {

        case ModuleNames.RenPy: {

            return parseRenPyClass(_class);

            break; }

        case ModuleNames.RenPy_SL2: {

            return parseRenPySL2Class(_class);

            break; }

        case ModuleNames.RenPy_ATL: {

            return parseRenPyATLClass(_class);

            break; }

        default: {

            throw new Error(`parseClass: Unknown module. "${module.module}"`);

            break; }

    }

}

export function parseClass(_class: CompiledClass): string {

    if(!DEBUG) {

        return parseClassInner(_class);

    } else {

        classStack.push(_class);
        if(classStack.length > DEBUG_COUNT) {
            classStack.shift();
        }
        
        try {
    
            return parseClassInner(_class);
    
        } catch(err) {
    
            for(const _class of classStack) {
                console.log(_class);
            }
    
            throw err;
    
        }

    }

}



export function decompileScript(chunks: DataChunk[]): string {

    const chunkOfInterest = chunks.find(chunk => chunk.slot == Slots.BeforeStaticTransforms);

    if(chunkOfInterest === undefined) {
        throw new Error('decompileScript: Could not find script chunk.');
    }

    const data = (chunkOfInterest.data as unknown[])[0] as CompiledScript;



    let outStr = '';



    const header = data[0];

    if(header.version !== 5003000) {
        throw new Error(`decompileScript: Unknown header version. ${header.version}`);
    }

    outStr += `# Ren'Py decompiled script.\n`;
    outStr += `# Decompiled with renpy-asset-viewer\n`;
    outStr += `# Decompiled on ${new Date()}\n`;
    outStr += `# Script Header:\n`;
    for(const [ key, value ] of Object.entries(header)) {
        outStr += `#    ${key}: ${value}\n`;
    }
    outStr += `# Decompilation is in early alpha, So please give feedback on bugs!\n`;
    outStr += `\n`;


    console.time('Decompile');


    const classes = data[1];

    for(const _class of classes) {

        outStr += parseClass(_class);
        // outStr += `\n`;

    }


    console.timeEnd('Decompile');


    return outStr;

}



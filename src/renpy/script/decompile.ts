
/*

    The compiled code is basically just an AST (Abstract Syntax Tree)
    Yep. So decompiling is pretty easy, but ALOT of random nodes need to program for.

    TODO: Replace nulls with unknown.

    TODO: This isn't really decompiling, It's more like prettyprinting instead.
    So maybe this should just be refactored to not used the word compiled but instead prettyprint, But IDK.


    
    NOTES:
        I sorta just went into this with no idea how decompilation works with this sorta stuff.
        I just tried to make it match as close as possible 1 to 1 to the actual source code of the compiled file.
        So stuff may be very very wrong, and I hope anyone that has more experience with this stuff may help.
        
*/

import { Depickler } from "../depickle";
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

export type CompiledScript = [
    CompiledScriptHeader,
    CompiledClass[]
];



export enum ModuleNames {
    RenPy = 'renpy.ast',
    RenPy_SL2 = 'renpy.sl2.slast',
    RenPy_ATL = 'renpy.atl'
}



function removeMultipleNewlines(str: string): string {
    // TODO: This doesn't work properly.
    return str.replace(/^([\s]*\n)+/g, '\n');
}

export function indent(str: string, indentation: number = 1): string {
    return str.split('\n').map(s => '    '.repeat(indentation) + s).join('\n');
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

    const depickled = Depickler.depickle(chunkOfInterest.data);

    const data = (depickled as unknown[])[0] as CompiledScript;

    const header = data[0];

    if(header.version !== 5003000) {
        throw new Error(`decompileScript: Unknown header version. ${header.version}`);
    }


    let outHeader = '';

    outHeader += `# Ren'Py decompiled script.\n`;
    outHeader += `# Decompiled with renpy-asset-viewer\n`;
    outHeader += `# Decompiled on ${new Date()}\n`;
    outHeader += `# Script Header:\n`;
    for(const [ key, value ] of Object.entries(header)) {
        outHeader += `#     ${key}: ${value}\n`;
    }
    outHeader += `# Decompilation is in very early alpha, so please give feedback on bugs!\n`;
    outHeader += '\n\n\n';


    let outCode = '';

    const classes = data[1];

    for(const _class of classes) {

        outCode += parseClass(_class);
        outCode += '\n';

    }


    
    return outHeader + removeMultipleNewlines(outCode);

}



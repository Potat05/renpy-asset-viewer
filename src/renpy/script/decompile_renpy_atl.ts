
import { ModuleNames, indent, parseClass, type CompiledClass } from "./decompile";



enum RenPyATLModuleClassNames {
    RawBlock = 'RawBlock',
    RawMultipurpose = 'RawMultipurpose',
    RawRepeat = 'RawRepeat',
    RawOn = 'RawOn',
    RawParallel = 'RawParallel'
}

interface RenPyATLClassStates {
    [RenPyATLModuleClassNames.RawBlock]: {
        animation: boolean;
        loc: [ string, number ];
        statements: CompiledClass[];
    };
    [RenPyATLModuleClassNames.RawMultipurpose]: {
        circles: string;
        duration: string | CompiledClass;
        expressions: [ CompiledClass, unknown ][]; // TODO: Figure out what unknowns is.
        loc: [ string, number ];
        properties: [ string, CompiledClass ][];
        revolution: null;
        splines: unknown[];
        warp_functions: null;
        warper: null;
    };
    [RenPyATLModuleClassNames.RawRepeat]: {
        loc: [ string, number ];
        repeats: null | number | CompiledClass;
    };
    [RenPyATLModuleClassNames.RawOn]: {
        handlers: {[key: string]: CompiledClass};
        loc: [ string, number ];
    };
    [RenPyATLModuleClassNames.RawParallel]: {
        blocks: CompiledClass[];
        loc: [ string, number ];
    };
}

interface RenPyATLClassArgs {
    [RenPyATLModuleClassNames.RawBlock]: [];
    [RenPyATLModuleClassNames.RawMultipurpose]: [];
    [RenPyATLModuleClassNames.RawRepeat]: [];
    [RenPyATLModuleClassNames.RawOn]: [];
    [RenPyATLModuleClassNames.RawParallel]: [];
}



export function parseRenPyATLClass(_class: CompiledClass): string {
    const module = _class.module;

    if(module.module !== ModuleNames.RenPy_ATL) {
        throw new Error(`parseRenPyATLClass: This function is only for parsing RenPy_ATL module classes.`);
    }


    switch(module.name) {

        case RenPyATLModuleClassNames.RawBlock: {

            const state = _class.state as RenPyATLClassStates[RenPyATLModuleClassNames.RawBlock];

            return `${state.statements.map(parseClass).join('')}`;

            break; }

        case RenPyATLModuleClassNames.RawMultipurpose: {

            const state = _class.state as RenPyATLClassStates[RenPyATLModuleClassNames.RawMultipurpose];

            // TODO: Figure more of this out.
            let str = '';
            if(state.duration != '0') {
                str += (typeof state.duration == 'string' || typeof state.duration == 'number' ? state.duration : parseClass(state.duration)) + '\n';
            }
            for(const expr of state.expressions) {
                str += `${parseClass(expr[0])}\n`;
            }
            for(const prop of state.properties) {
                str += `${prop[0]} ${parseClass(prop[1])}\n`;
            }
            return str;

            break; }

        case RenPyATLModuleClassNames.RawRepeat: {

            const state = _class.state as RenPyATLClassStates[RenPyATLModuleClassNames.RawRepeat];

            return `repeat${state.repeats == null ? '' : ` ${typeof state.repeats == 'number' ? state.repeats : parseClass(state.repeats)}`}\n`;

            break; }

        case RenPyATLModuleClassNames.RawOn: {

            const state = _class.state as RenPyATLClassStates[RenPyATLModuleClassNames.RawOn];

            let str = '';
            for(const [ key, value ] of Object.entries(state.handlers)) {
                str += `on ${key}:\n${indent(parseClass(value))}\n`;
            }
            return str;

            break; }

        case RenPyATLModuleClassNames.RawParallel: {

            const state = _class.state as RenPyATLClassStates[RenPyATLModuleClassNames.RawParallel];

            return `parallel:\n${indent(state.blocks.map(parseClass).join('\n'))}`;

            break; }

        default: {

            throw new Error(`parseRenPyATLClass: Unknown class "${module.name}"`)

            break; }

    }

}

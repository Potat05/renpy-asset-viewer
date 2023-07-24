import { ModuleNames, type CompiledClass, parseClass, indent } from "./decompile";



enum RenPyModuleClassNames {
    Init = 'Init',
    Define = 'Define',
    PyCode = 'PyCode',
    PyExpr = 'PyExpr',
    Default = 'Default',
    Python = 'Python',
    Return = 'Return',
    Label = 'Label',
    Screen = 'Screen',
    ParameterInfo = 'ParameterInfo',
    Image = 'Image',
    Style = 'Style',
    Transform = 'Transform',
    Jump = 'Jump',
    UserStatement = 'UserStatement',
    Say = 'Say',
    Show = 'Show',
    With = 'With',
    If = 'If',
    Menu = 'Menu',
    Scene = 'Scene',
    Hide = 'Hide',
    While = 'While',
    Pass = 'Pass',
    Call = 'Call'
}

interface RenPyClassStates {
    [RenPyModuleClassNames.Init]: [
        null,
        {
            block: CompiledClass[];
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            priority: number;
        }
    ];
    [RenPyModuleClassNames.Define]: [
        null,
        {
            code: CompiledClass;
            filename: string;
            index: null;
            linenumber: string;
            name: [ string, number, number ];
            next: null;
            operator: string;
            store: string;
            varname: string;
        }
    ];
    [RenPyModuleClassNames.PyCode]: (
        // TODO: This is stupid, Find another way to do this.
        number | string | CompiledClass | unknown[]
    )[];
    [RenPyModuleClassNames.PyExpr]: [
        null,
        {
            filename: string;
            linenumber: number;
            py: number;
        }
    ];
    [RenPyModuleClassNames.Default]: [
        null,
        {
            code: CompiledClass;
            filename: string;
            linenumber: string;
            name: [ string, number, number ];
            next: null;
            store: string;
            varname: string;
        }
    ];
    [RenPyModuleClassNames.Python]: [
        null,
        {
            code: CompiledClass;
            filename: string;
            hide: boolean;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            store: string;
        }
    ];
    [RenPyModuleClassNames.Return]: [
        null,
        {
            expression: null;
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.Label]: [
        null,
        {
            block: CompiledClass[];
            filename: string;
            hide: boolean;
            linenumber: number;
            name: string;
            next: null;
            parameters: null;
        }
    ];
    [RenPyModuleClassNames.Screen]: [
        null,
        {
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            screen: CompiledClass;
        }
    ];
    [RenPyModuleClassNames.ParameterInfo]: {
        extrakw: null;
        extrapos: null;
        keyword_only: unknown[]; // TODO: Figure what these unknowns are suppose to be.
        parameters: [ string, string | CompiledClass | null ][];
        positional: string[];
        positional_only: unknown[]
    };
    [RenPyModuleClassNames.Image]: [
        null,
        {
            atl: null | CompiledClass;
            code: CompiledClass;
            filename: string;
            imgname: string[];
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.Style]: [
        null,
        {
            clear: boolean;
            delattr: unknown[];
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            parent: null;
            properties: {[key: string]: CompiledClass};
            style_name: string;
            take: null;
            variant: null;
        }
    ];
    [RenPyModuleClassNames.Transform]: [
        null,
        {
            atl: CompiledClass;
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            parameters: null | CompiledClass;
            varname: string;
        }
    ];
    [RenPyModuleClassNames.Jump]: [
        null,
        {
            expression: boolean;
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            target: string;
        }
    ];
    [RenPyModuleClassNames.UserStatement]: [
        null,
        {
            block: CompiledClass[];
            code_block: null | CompiledClass;
            filename: string;
            line: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            parsed: (string | CompiledClass)[][];
            rollback: string;
            subparsers: unknown[];
            translatable: boolean;
            translation_relevant: boolean;
        }
    ];
    [RenPyModuleClassNames.Say]: [
        null,
        {
            arguments: null | CompiledClass;
            attributes: unknown;
            filename: string;
            interact: boolean;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            rollback: string;
            temporary_attributes: unknown;
            what: string;
            who: null | string;
            who_fast: boolean;
            with_: unknown;
        }
    ];
    [RenPyModuleClassNames.Show]: [
        null,
        {
            atl: null | CompiledClass;
            filename: string;
            imspec: [ unknown[], unknown, unknown, unknown[], unknown, unknown, string[] ];
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.With]: [
        null,
        {
            expr: CompiledClass | string;
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            paired: null | CompiledClass;
        }
    ];
    [RenPyModuleClassNames.If]: [
        null,
        {
            entries: [ CompiledClass | string, CompiledClass[] ][];
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.Menu]: [
        null,
        {
            arguments: null | CompiledClass;
            filename: string;
            has_caption: boolean;
            item_arguments: (CompiledClass | null)[];
            items: [ string, string | null | CompiledClass, null | CompiledClass[] ][];
            linenumber: number;
            name: [ string, number, number ];
            next: null;
            rollback: string;
            set: unknown;
            statement_start: CompiledClass;
            with_: unknown;
        }
    ];
    [RenPyModuleClassNames.Scene]: [
        null,
        {
            atl: null | CompiledClass;
            filename: string;
            imspec: [ unknown[], unknown, unknown, unknown[], unknown, unknown, string[] ];
            layer: unknown;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.Hide]: [
        null,
        {
            filename: string;
            imspec: [ unknown[], unknown, unknown, unknown[], unknown, unknown, string[] ];
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.While]: [
        null,
        {
            block: CompiledClass[];
            condition: CompiledClass;
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.Pass]: [
        null,
        {
            filename: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
    [RenPyModuleClassNames.Call]: [
        null,
        {
            arguments: null | CompiledClass;
            expression: boolean;
            filename: string;
            label: string;
            linenumber: number;
            name: [ string, number, number ];
            next: null;
        }
    ];
}

interface RenPyClassArgs {
    [RenPyModuleClassNames.Init]: [];
    [RenPyModuleClassNames.Define]: [];
    [RenPyModuleClassNames.PyCode]: [];
    [RenPyModuleClassNames.PyExpr]: [
        number,
        number,
        string,
        string
    ];
    [RenPyModuleClassNames.Default]: [];
    [RenPyModuleClassNames.Python]: [];
    [RenPyModuleClassNames.Return]: [];
    [RenPyModuleClassNames.Label]: [];
    [RenPyModuleClassNames.Screen]: [];
    [RenPyModuleClassNames.Image]: [];
    [RenPyModuleClassNames.Style]: [];
    [RenPyModuleClassNames.Transform]: [];
    [RenPyModuleClassNames.Jump]: [];
    [RenPyModuleClassNames.UserStatement]: [];
    [RenPyModuleClassNames.Say]: [];
    [RenPyModuleClassNames.Show]: [];
    [RenPyModuleClassNames.With]: [];
    [RenPyModuleClassNames.If]: [];
    [RenPyModuleClassNames.Menu]: [];
    [RenPyModuleClassNames.Scene]: [];
    [RenPyModuleClassNames.Hide]: [];
    [RenPyModuleClassNames.While]: [];
    [RenPyModuleClassNames.Pass]: [];
    [RenPyModuleClassNames.Call]: [];
}



export function parseRenPyClass(_class: CompiledClass): string {
    const module = _class.module;

    if(module.module !== ModuleNames.RenPy) {
        throw new Error(`parseRenPyClass: This function is only for parsing RenPy module classes.`);
    }

    switch(module.name) {

        case RenPyModuleClassNames.Init: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Init];

            return state[1].block.map(parseClass).join('\n');

            break; }

        case RenPyModuleClassNames.Define: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Define];

            const store = state[1].store.split('.').pop() ?? '';

            if(store == '' || store == 'store') {
                return `define ${state[1].varname} ${state[1].operator} ${parseClass(state[1].code)}\n`;
            } else {
                return `define ${state[1].store.split('.').pop() ?? ''}.${state[1].varname} ${state[1].operator} ${parseClass(state[1].code)}\n`;
            }

            break; }

        case RenPyModuleClassNames.PyCode: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.PyCode];

            // TODO: Sometimes there's different versions of this?
            // So maybe do something about that instead of this hack.

            let mode: string | undefined = undefined;

            for(let i = 0; i < state.length; i++) {
                const value = state[i];

                if(mode === undefined) {
                    if(typeof value == 'string') mode = value;
                } else {

                    if(typeof value == 'string') return value;
                    if(!Array.isArray(value) && typeof value != 'number') return parseClass(value);

                }

            }

            throw new Error('parseRenPyClass: Failed to parse PyCode.');

            break; }

        case RenPyModuleClassNames.PyExpr: {

            const args = _class.args as RenPyClassArgs[RenPyModuleClassNames.PyExpr];

            // TODO - What is this? expr is either on 3 or 0 if 3 doesn't exist.
            return args[3] ?? args[0];

            break; }

        case RenPyModuleClassNames.Default: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Default];

            const store = state[1].store.split('.').pop() ?? '';

            if(store == '' || store == 'store') {
                return `default ${state[1].varname} = ${parseClass(state[1].code)}\n`;
            } else {
                return `default ${state[1].store.split('.').pop() ?? ''}.${state[1].varname} = ${parseClass(state[1].code)}\n`;
            }

            break; }

        case RenPyModuleClassNames.Python: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Python];

            const code = parseClass(state[1].code);

            let newlines: number[] = [];
            for(let i = 0; i != -1; i = code.indexOf('\n', i + 1)) {
                newlines.push(i);
            }

            if(newlines.every(nl => nl == 0 || nl == code.length - 1)) {
                return `$ ${code.replace('\n', '')}\n`;
            } else {
                return `init python:\n${indent(code)}\n`;
            }

            break; }

        case RenPyModuleClassNames.Return: {

            // TODO: Is this correct?
            return '';

            break; }

        case RenPyModuleClassNames.Label: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Label];

            let str = '';
            for(const sub of state[1].block) {
                str += parseClass(sub);
            }
            str = indent(str);

            return `label ${state[1].name}:\n${str}`;

            break; }

        case RenPyModuleClassNames.Screen: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Screen];

            return parseClass(state[1].screen);

            break; }

        case RenPyModuleClassNames.ParameterInfo: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.ParameterInfo];

            return state.parameters.map(param => {
                return `${param[1] == null ? param[0] : `${param[0]}=${typeof param[1] == 'string' ? param[1] : parseClass(param[1])}`}`;
            }).join(', ');

            break; }

        case RenPyModuleClassNames.Image: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Image];

            if(state[1].code != null) {
                return `image ${state[1].imgname.join(', ')} = ${parseClass(state[1].code)}\n`;
            } else if(state[1].atl != null) {
                return `image ${state[1].imgname.join(', ')}:\n${indent(parseClass(state[1].atl))}\n`;
            } else {
                throw new Error('parseRenPyClass: Invalid image.');
            }

            break; }

        case RenPyModuleClassNames.Style: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Style];

            return `style ${state[1].style_name}:\n${indent(Object.entries(state[1].properties).map(prop => {
                return `${prop[0]} ${parseClass(prop[1])}`;
            }).join('\n'))}\n`;

            break; }

        case RenPyModuleClassNames.Transform: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Transform];

            return `transform ${state[1].varname}${state[1].parameters == null ? '' : `(${parseClass(state[1].parameters)})`}:\n${indent(parseClass(state[1].atl))}\n`;

            break; }
        
        case RenPyModuleClassNames.Jump: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Jump];

            return `jump ${state[1].target}\n`;

            break; }

        case RenPyModuleClassNames.UserStatement: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.UserStatement];

            // TODO: Use parsed state instead of line.
            return `${state[1].line}\n`;

            break; }

        case RenPyModuleClassNames.Say: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Say];

            return `${state[1].who === null ? '' : `${state[1].who} `}"${state[1].what}"\n`;

            break; }

        case RenPyModuleClassNames.Show: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Show];

            // TODO: Validate.
            return `show ${state[1].imspec[6].join(' ')}\n`;

            break; }

        case RenPyModuleClassNames.With: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.With];

            // TODO: Validate.
            if(state[1].expr == 'None') {
                if(state[1].paired == null) {
                    throw new Error('parseRenPyClass: With without any args.');
                }
                return `with ${parseClass(state[1].paired)}`;
            } else {
                return `with ${typeof state[1].expr == 'string' ? state[1].expr : parseClass(state[1].expr)}\n`;
            }

            break; }

        case RenPyModuleClassNames.If: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.If];

            let str = '';
            for(let i = 0; i < state[1].entries.length; i++) {
                const entry = state[1].entries[i];
                if(i == 0) {
                    str += `if ${typeof entry[0] == 'string' ? entry[0] : parseClass(entry[0])}:\n${indent(entry[1].map(parseClass).join('\n'))}\n`;
                } else {
                    if(entry[0] != null && entry[0] != 'True') {
                        str += `elif ${typeof entry[0] == 'string' ? entry[0] : parseClass(entry[0])}:\n${indent(entry[1].map(parseClass).join('\n'))}\n`;
                    } else {
                        str += `else:\n${indent(entry[1].map(parseClass).join('\n'))}\n`;
                    }
                }
            }
            return str;

            break; }
            
        case RenPyModuleClassNames.Menu: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Menu];

            let str = `menu${state[1].arguments == null ? '' : `(${parseClass(state[1].arguments)})`}:\n`;
            for(const item of state[1].items) {

                str += indent(`"${item[0]}"`);

                if(item[1] != 'True' && item[1] != null) {
                    str += ' if ';
                    if(typeof item[1] == 'string') {
                        str += item[1];
                    } else {
                        str += parseClass(item[1]);
                    }
                }

                if(item[2] == null) {
                    str += '\n';
                } else {
                    str += `:\n`;
                    for(const itemdata of item[2]) {
                        str += `${indent(parseClass(itemdata), 2)}\n`;
                    }
                }

            }
            return str;

            break; }

        case RenPyModuleClassNames.Scene: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Scene];

            // TODO: Validate.
            return `scene ${state[1].imspec[6].join(' ')}\n`;

            break; }

        case RenPyModuleClassNames.Hide: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Hide];

            return `hide ${state[1].imspec[6].join(' ')}\n`;

            break; }

        case RenPyModuleClassNames.While: {

            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.While];

            return `while ${parseClass(state[1].condition)}:\n${indent(state[1].block.map(parseClass).join('\n'))}\n`;

            break; }

        case RenPyModuleClassNames.Pass: {

            // TODO: Validate.
            return `pass\n`;

            break; }

        case RenPyModuleClassNames.Call: {

            // TODO: Validate.
            const state = _class.state as RenPyClassStates[RenPyModuleClassNames.Call];

            return `call ${state[1].label} from `;

            break; }

        default: {

            throw new Error(`parseRenPyClass: Unknown class "${module.name}"`)

            break; }

    }
}

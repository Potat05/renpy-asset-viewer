
import { ModuleNames, indent, parseClass, type CompiledClass, type CompiledModule } from "./decompile";



enum RenPySL2ModuleClassNames {
    SLScreen = 'SLScreen',
    SLDisplayable = 'SLDisplayable',
    SLPython = 'SLPython',
    SLIf = 'SLIf',
    SLBlock = 'SLBlock',
    SLFor = 'SLFor',
    SLUse = 'SLUse',
    SLTransclude = 'SLTransclude',
    SLDefault = 'SLDefault'
}

interface RenPySL2ClassStates {
    [RenPySL2ModuleClassNames.SLScreen]: {
        analysis: null;
        children: CompiledClass[];
        keyword: [ string, CompiledClass ][];
        layer: string;
        location: [ string, number ];
        modal: string;
        name: string;
        parameters: null | CompiledClass;
        predict: string;
        prepared: boolean;
        roll_forward: string;
        sensitive: string;
        serial: number;
        tag: string | null;
        variant: string;
        zorder: string;
    };
    [RenPySL2ModuleClassNames.SLDisplayable]: {
        child_or_fixed: boolean;
        children: CompiledClass[];
        default_keywords: {
            [key: string]: unknown;
        }; // TODO: Figure out these unknowns.
        displayable: CompiledModule;
        hotspot: boolean;
        imagemap: boolean;
        keyword: [ string, CompiledClass ][];
        location: [ string, number ];
        name: string;
        pass_context: boolean;
        positional: CompiledClass[];
        replaces: boolean;
        scope: boolean;
        serial: number;
        style: null;
        unique: boolean;
        variable: null;
    };
    [RenPySL2ModuleClassNames.SLPython]: {
        code: CompiledClass;
        location: [ string, number ];
        serial: number;
    };
    [RenPySL2ModuleClassNames.SLIf]: {
        entries: [ CompiledClass | string, CompiledClass ][];
        location: [ string, number ];
        serial: number;
    };
    [RenPySL2ModuleClassNames.SLBlock]: {
        children: CompiledClass[];
        keyword: [ string, CompiledClass ][];
        location: [ string, number ];
        serial: number;
    };
    [RenPySL2ModuleClassNames.SLFor]: {
        children: CompiledClass[];
        expression: CompiledClass;
        index_expression: null;
        keyword: [ string, CompiledClass ][];
        location: [ string, number ];
        serial: number;
        variable: string;
    };
    [RenPySL2ModuleClassNames.SLUse]: {
        args: null;
        ast: null;
        block: null;
        id: null;
        location: [ string, number ];
        serial: number;
        target: string;
    };
    [RenPySL2ModuleClassNames.SLTransclude]: {
        location: [ string, number ];
        serial: number;
    };
    [RenPySL2ModuleClassNames.SLDefault]: {
        expression: CompiledClass;
        location: [ string, number ];
        serial: number;
        variable: string;
    };
}

interface RenPySL2ClassArgs {
    [RenPySL2ModuleClassNames.SLScreen]: [];
    [RenPySL2ModuleClassNames.SLDisplayable]: [];
    [RenPySL2ModuleClassNames.SLPython]: [];
    [RenPySL2ModuleClassNames.SLIf]: [];
    [RenPySL2ModuleClassNames.SLBlock]: [];
    [RenPySL2ModuleClassNames.SLFor]: [];
    [RenPySL2ModuleClassNames.SLUse]: [];
    [RenPySL2ModuleClassNames.SLTransclude]: [];
}



export function parseRenPySL2Class(_class: CompiledClass): string {
    const module = _class.module;

    if(module.module !== ModuleNames.RenPy_SL2) {
        throw new Error(`parseRenPySL2Class: This function is only for parsing RenPy_SL2 module classes.`);
    }


    switch(module.name) {

        case RenPySL2ModuleClassNames.SLScreen: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLScreen];

            return `screen ${state.name}${state.parameters == null ? '' : `(${parseClass(state.parameters)})`}:\n${indent(
                (state.tag == null ? '' : state.tag) + '\n' +
                state.keyword.map(kw => `${kw[0]} ${parseClass(kw[1])}\n`).join('\n') +
                state.children.map(parseClass).join('')
            )}\n`;

            break; }

        case RenPySL2ModuleClassNames.SLDisplayable: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLDisplayable];

            function keywords(keywords: [ string, CompiledClass ][], join: string = '\n', padStart: string = ''): string {
                if(keywords.length == 0) return '';
                return padStart + keywords.map(kw => `${kw[0]} ${parseClass(kw[1])}`).join(join);
            }
        
            function positionals(positionals: CompiledClass[]): string {
                return positionals.map(parseClass).join(' ');
            }

            function children(children: CompiledClass[]): string {
                return children.map(parseClass).join('\n');
            }

            // TODO: Refactor this, I think all classes of same module have same parsing method.

            // This is temporary for when I refactor this.
            // We just join them so we don't need 2 switch statements.
            switch(`${state.displayable.module}:${state.displayable.name}`) {
                case 'renpy.sl2.sldisplayables:sl2add': {

                    return `add ${positionals(state.positional)} ${state.keyword.map(kw => `${kw[0]} ${parseClass(kw[1])}`).join(' ')}\n`;

                    break; }

                case 'renpy.display.layout:Grid': {

                    return `grid ${positionals(state.positional)}:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;

                    break; }

                case 'renpy.ui:_textbutton': {

                    return `textbutton ${positionals(state.positional)}:\n${indent(keywords(state.keyword))}\n`;

                    break; }

                case 'renpy.display.layout:Null': {

                    return `null${keywords(state.keyword, ' ', ' ')}\n`;

                    break; }

                case 'renpy.display.layout:MultiBox': {

                    // TODO: Is keywords suppose to be like 'box *keywords*:' or 'box:\n*keywords*'?
                    return `${state.style}${keywords(state.keyword, ' ', ' ')}:\n${indent(children(state.children))}\n`;

                    break; }

                case 'renpy.text.text:Text': {

                    return `text ${positionals(state.positional)}${keywords(state.keyword, ' ', ' ')}\n`;

                    break; }

                case 'renpy.ui:_imagemap': {

                    return `imagemap:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;
                    
                    break; }

                case 'renpy.ui:_hotspot': {

                    return `${state.name}${positionals(state.positional)} ${keywords(state.keyword)}`;

                    break; }

                case 'renpy.ui:_imagebutton': {

                    return `imagebutton:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;
                    
                    break; }

                case 'renpy.display.layout:Window': {

                    return `${state.name}${state.positional.length == 0 ? '' : ` ${positionals(state.positional)}`}:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;

                    break; }

                case 'renpy.display.behavior:Input': {

                    return `input ${keywords(state.keyword)}\n`;

                    break; }

                case 'renpy.sl2.sldisplayables:sl2viewport': {

                    return `viewport:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;

                    break; }

                case 'renpy.sl2.sldisplayables:sl2vpgrid': {

                    return `vpgrid:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;

                    break; }

                case 'renpy.ui:_label': {

                    return `label ${positionals(state.positional)}\n`;

                    break; }

                case 'renpy.ui:_key': {

                    return `key ${positionals(state.positional)}${keywords(state.keyword, ' ', ' ')}\n`;

                    break; }

                case 'renpy.display.behavior:Timer': {

                    return `timer ${positionals(state.positional)}${keywords(state.keyword, ' ', ' ')}\n`;

                    break; }

                case 'renpy.sl2.sldisplayables:sl2bar': {

                    return `bar:\n${indent(keywords(state.keyword))}\n${indent(children(state.children))}\n`;

                    break; }

                case 'renpy.display.behavior:Button': {

                    // TODO: Validate.
                    return `button ${positionals(state.positional)}${keywords(state.keyword, ' ', ' ')}:\n${children(state.children)}`;

                    break; }

                case 'renpy.display.behavior:OnEvent': {

                    return `on ${positionals(state.positional)}${keywords(state.keyword, ' ', ' ')}\n`;

                    break; }

                default: {

                    throw new Error(`parseRenPySL2Class: Unsupported displayable module: ${state.displayable.module}:${state.displayable.name}`);

                    break; }
            }

            break; }

        case RenPySL2ModuleClassNames.SLPython: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLPython];

            const code = parseClass(state.code);

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

        case RenPySL2ModuleClassNames.SLIf: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLIf];

            let str = '';
            for(let i = 0; i < state.entries.length; i++) {
                const entry = state.entries[i];
                if(i == 0) {
                    str += `if ${typeof entry[0] == 'string' ? entry[0] : parseClass(entry[0])}:\n${indent(parseClass(entry[1]))}\n`;
                } else {
                    if(entry[0] != null) {
                        str += `elif ${typeof entry[0] == 'string' ? entry[0] : parseClass(entry[0])}:\n${indent(parseClass(entry[1]))}\n`;
                    } else {
                        str += `else:\n${indent(parseClass(entry[1]))}\n`;
                    }
                }
            }
            return str;

            break; }

        case RenPySL2ModuleClassNames.SLBlock: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLBlock];

            let str = '';
            for(const child of state.children) {
                str += parseClass(child);
            }
            for(const kw of state.keyword) {
                str += `${kw[0]} ${parseClass(kw[1])}\n`;
            }
            // Pass keyword is used for empty block.
            if(str.length == 0) {
                str += 'pass\n';
            }
            // Blocks are expected to be indented by parent.
            // str = indent(str);
            return str;

            break; }

        case RenPySL2ModuleClassNames.SLFor: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLFor];

            return `for ${state.variable} in ${parseClass(state.expression)}:\n${indent(
                state.children.map(parseClass).join('')
            )}`;

            break; }

        case RenPySL2ModuleClassNames.SLUse: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLUse];

            return `use ${state.target}`;

            break; }

        case RenPySL2ModuleClassNames.SLTransclude: {

            return `transclude\n`;

            break; }

        case RenPySL2ModuleClassNames.SLDefault: {

            const state = _class.state as RenPySL2ClassStates[RenPySL2ModuleClassNames.SLDefault];

            return `default ${state.variable} = ${parseClass(state.expression)}`;

            break; }

        default: {

            throw new Error(`parseRenPySL2Class: Unknown class "${module.name}"`)

            break; }

    }
}

<script lang="ts">
    import { onMount } from "svelte";
    import { ObjectUtils } from "../../common/ObjectUtils";
    import { loadScript } from "../../renpy/script/load";
    import { decompileScript } from "../../renpy/script/decompile";

    export let path: string;
    export let file: Blob;

    let decompiledScript: string | undefined;
    let decompilationError: string | undefined;
    let dumpedStrings: string[] | undefined;

    onMount(async () => {

        try {
            var compiledScript = loadScript(await file.arrayBuffer());
        } catch(err) {
            decompilationError = String(err);
            throw err;
        }
        try {
            decompiledScript = decompileScript(compiledScript);
            decompiledScript = `# ${path}\n${decompiledScript}`;
        } catch(err) {
            decompilationError = String(err);
            // Failed to decompile, But we can still dump strings.
            dumpedStrings = Array.from(ObjectUtils.dumpStrings(compiledScript));
            throw err;
        }

    });

</script>

<style>

    pre {
        background-color: #222;
        color: white;

        margin: 0;
        padding: 2px;
        border-top: 1px solid black;
    }

    .error {
        color: red;
    }

    h1 {
        background-color: #222;
        color: white;
    }

</style>

<div title={path}>
    {#if decompilationError}
        <pre class="error">{decompilationError}</pre>

        {#if dumpedStrings}
            <h1>Unable to decompile code, Here's the dumped strings instead:</h1>
            {#each dumpedStrings as string}
                <pre>{string}</pre>
            {/each}
        {/if}
    {/if}
    {#if decompiledScript}
        <pre>{decompiledScript}</pre>
    {/if}
</div>

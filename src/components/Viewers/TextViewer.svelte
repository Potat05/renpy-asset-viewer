<script lang="ts">

    export let path: string;
    export let file: Blob;

</script>

<style>

    pre {
        background-color: #222;
        color: white;
    }

</style>

{#await file.text() then text}
    <pre title={path}>
        {text}
    </pre>
{/await}

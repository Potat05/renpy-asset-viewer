
<script lang="ts">
    import { onMount } from "svelte";
    import type { Directory } from "../common/Directory";
    import Dropzone from "../components/Dropzone.svelte";
    import { extension_viewers, default_viewer } from "../components/FileTypes";
    import FolderElement from "../components/FolderElement.svelte";
    import { contentViewerContainerStore } from "../stores";

    let directoryContainer: HTMLDivElement;
    let contentViewerContainer: HTMLDivElement;

    onMount(() => {
        contentViewerContainerStore.set(contentViewerContainer);
    });



    function dropDirectory(ev: { detail: { dir: Directory, name: string } }) {

        new FolderElement({
            target: directoryContainer,
            props: {
                path: `${ev.detail.name}/`,
                directory: ev.detail.dir
            }
        });

    }

    function dropFile(ev: { detail: { file: File, name: string } }) {

        const { file, name } = ev.detail;
        const extension = name.slice(name.lastIndexOf('.'));

        const ViewerComponent = extension_viewers[extension as keyof typeof extension_viewers] ?? default_viewer;

        if(ViewerComponent == undefined) {
            console.warn(`No viewer for "${name}"`);
            return;
        }

        new ViewerComponent({
            target: contentViewerContainer,
            props: { path: name, file }
        });

    }

</script>

<Dropzone
    on:dropdirectory={dropDirectory}
    on:dropfile={dropFile}
/>



<style>

    .page {
        display: grid;
        grid: auto-flow / 1fr 1fr;

        width: 100%;
        height: 100%;
    }

    /* .overlay {
        user-select: none;
        pointer-events: none;
        position: fixed;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
    }

    .warning {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;

        text-align: right;

        width: 100%;
        height: 100%;

        color: #a1a1aa;
        mix-blend-mode: difference;
        
        font-size: larger;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    } */

</style>

<!-- <div class="overlay">
    <div class="warning">
        All files that are inputted into this site are ONLY processed client-side.
        <br />
        This means we DO NOT know anything about the files you input.
    </div>
</div> -->

<div
    class="page"
>
    
    <div
        bind:this={directoryContainer}
    />
    
    <div
        bind:this={contentViewerContainer}
    />

</div>


<script lang="ts">
    import { onMount } from "svelte";
    import { default_icon, default_viewer, extension_icons, extension_viewers } from "./FileTypes";
    import { contentViewerContainerStore } from "../stores";

    let contentViewerContainer: Element;
    contentViewerContainerStore.subscribe(element => {
        contentViewerContainer = element;
    });

    let iconContainer: HTMLSpanElement;

    export let path: string = '';
    export let file: Blob;

    $: extension = (path.slice(path.lastIndexOf('.')) ?? '');

    onMount(() => {

        const IconComponent = extension_icons[extension as keyof typeof extension_icons] ?? default_icon;

        new IconComponent({
            target: iconContainer,
            props: { path, file }
        });

    });

    function open() {

        const ViewerComponent = extension_viewers[extension as keyof typeof extension_viewers] ?? default_viewer;

        if(ViewerComponent == undefined) {
            console.warn(`No viewer for "${path}"`);
            return;
        }

        new ViewerComponent({
            target: contentViewerContainer,
            props: { path, file }
        });

    }

    function download() {

        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = path.split('/').pop() ?? 'download-unknown';
        a.click();

    }

    function keydown(ev: KeyboardEvent) {

        if(ev.code == 'KeyD') {
            download();
        }

    }

</script>

<style>

    .file {
        color: white;
        background: 0 0.1em no-repeat #222;

        display: flex;
        align-items: center;

        height: 32px;
    }

    .icon {
        margin-right: 5px;
        max-width: 28px;
        max-height: 28px;
        display: flex;
    }

</style>

<button class="file" on:click={open} on:keydown={keydown}>
    <span class="icon" bind:this={iconContainer}/>
    {path.slice(path.lastIndexOf('/') + 1)}
</button>

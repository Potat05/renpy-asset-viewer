
<script lang="ts">
    import { Directory } from "../common/Directory";
    import { ArchiveReader } from "../renpy/archive";
    import FileElement from "./FileElement.svelte";
    import FolderElement from "./FolderElement.svelte";
    import Icon_Folder2 from "svelte-bootstrap-icons/lib/Folder2.svelte";
    import Icon_Folder2Open from "svelte-bootstrap-icons/lib/Folder2Open.svelte";

    export let path: string;
    export let directory: Directory;

    export let expanded: boolean | undefined = false;

    let loaded: boolean = false;
    let folderListContainer: HTMLUListElement;

    function toggle() {
		expanded = !expanded;
	}



    function entryImportance(name: string): number {
        if(name.endsWith('/')) return 1;
        if(name.endsWith('.rpa')) return 1;
        return 0;
    }


        
    $: if(expanded) {
        if(!loaded) {
            loaded = true;
            
            directory.listEntries().then(async entryNames => {

                entryNames = entryNames.sort((a, b) => entryImportance(b) - entryImportance(a));

                // TODO: Load these asynchronously.
                for(const entryName of entryNames) {
                    const entry = await (entryName.endsWith('/') ? directory.getDirectory(entryName) : directory.getFile(entryName));
                    
                    await createNode(folderListContainer, entryName, entry);
                }

            });
        }
    }
    


    async function createNode(target: Element, name: string, entry: Blob | Directory | undefined) {

        if(entry === undefined) return null;

        if(name.endsWith('.rpa') && !(entry instanceof Directory) && entry !== undefined) {
            entry = await new ArchiveReader(entry).readArchive();
            name += '/';
        }

        if(entry instanceof Directory) {

            new FolderElement({
                target,
                props: {
                    path: `${path}${name}`,
                    directory: entry
                }
            });

        } else {
        
            new FileElement({
                target,
                props: {
                    path: `${path}${name}`,
                    file: entry
                }
            });

        }

    }

</script>

<style>

    .folder {
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
    
    .list {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        list-style-type: disc;
        margin-block-start: 0;
        padding-inline-start: 20px;

        border-left: 2px #888 solid;
    }

    .hidden {
        display: none;
    }

</style>

<button
    on:click={toggle}
    class="folder"
>
    <span class="icon">
        {#if expanded}
            <Icon_Folder2Open class="icon"/>
        {:else}
            <Icon_Folder2 class="icon"/>
        {/if}
    </span>
    {`${path.split('/').at(-2)}/`}
</button>

<ul
    class="list"
    class:hidden={!expanded}
    bind:this={folderListContainer}
/>



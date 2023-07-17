
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { FileSystemDirectoryEntry_Directory } from "../common/DataTransferDirectory";
    import { EarFill } from "svelte-bootstrap-icons";
    const dispatcher = createEventDispatcher();



    function isDataTransferFiles(transfer: DataTransfer | null): boolean {
        if(transfer == null) return false;
        return (transfer.types.length == 1 && transfer.types[0] == 'Files');
    }

    let dropzoneVisible = false;

    function dropzoneDragOver(ev: DragEvent) {
        if(ev.dataTransfer == null) return;
        if(!isDataTransferFiles(ev.dataTransfer)) return;
        ev.preventDefault();
        dropzoneVisible = true;
    }

    function dropzoneDragLeave(_ev: DragEvent) {
        const ev = _ev as DragEvent & { fromElement: Node | null };
        const fromElement = ev.fromElement;
        if(fromElement == null) {
            dropzoneVisible = false;
        }
    }

    function dropzoneDrop(ev: DragEvent) {
        ev.preventDefault();
        dropzoneVisible = false;
        const dataTransfer = ev.dataTransfer;
        if(dataTransfer == null || !isDataTransferFiles(dataTransfer)) return;

        const entry = dataTransfer.items[0].webkitGetAsEntry();
        if(entry == null) return;

        if(entry.isDirectory) {
            const dir = new FileSystemDirectoryEntry_Directory(entry as FileSystemDirectoryEntry);
    
            dispatcher('dropdirectory', { dir, name: entry.name });
        } else if(entry.isFile) {
            (entry as FileSystemFileEntry).file(file => {
                 dispatcher('dropfile', { file, name: entry.name });
            });
        }

    }

</script>


<style>

    .file-dropzone {
        display: none;

        position: fixed;

        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }

    .file-dropzone.visible {
        display: flex;
    }

    .dropzone-content {
        display: flex;
        justify-content: center;
        align-items: center;

        position: absolute;
        margin: 10px;
        width: calc(100vw - 50px);
        height: calc(100vh - 50px);

        background-color: rgba(255, 255, 255, 0.3);
        border: 15px dashed #FFFFFF;
        backdrop-filter: blur(3px);

        font-size: 50px;
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
        font-weight: 900;
    }

    .dropzone-text {
        text-align: center;
    }

</style>

<svelte:body
    on:dragover={dropzoneDragOver}
    on:dragleave={dropzoneDragLeave}
    on:drop={dropzoneDrop}
/>

<div
    class="file-dropzone{dropzoneVisible ? ' visible' : ''}"
>
    <div class="dropzone-content">
        <div class="dropzone-text">
            File Dropzone
            <br />

        </div>

    </div>
</div>


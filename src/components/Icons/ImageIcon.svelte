<script lang="ts">

    export let path: string;
    export let file: Blob;

</script>

<style>

    img {
        max-width: 100%;
        max-height: 100%;
        
        object-fit: contain;
        object-position: center;
    }

</style>

<img
    src={URL.createObjectURL(file)}
    title={path}
    alt={path}
/>

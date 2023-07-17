<script lang="ts">

    export let path: string;
    export let file: Blob;

</script>

<img
    src={URL.createObjectURL(file)}
    title={path}
    alt={path}
/>

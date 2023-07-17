<script lang="ts">

    export let path: string;
    export let file: Blob;

</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video
    src={URL.createObjectURL(file)}
    title={path}
    controls
    loop
/>


import Icon_FileEarmark from "svelte-bootstrap-icons/lib/FileEarmark.svelte"
import Icon_Film from "svelte-bootstrap-icons/lib/Film.svelte";
import Icon_VolumeUp from 'svelte-bootstrap-icons/lib/VolumeUp.svelte';
import Icon_Image from "./Icons/ImageIcon.svelte";



export const default_icon = Icon_FileEarmark;

export const extension_icons = {
    // Image
    '.png': Icon_Image,
    '.gif': Icon_Image,
    '.jpg': Icon_Image,
    '.jpeg': Icon_Image,
    '.webp': Icon_Image,
    // Video
    '.mp4': Icon_Film,
    '.mov': Icon_Film,
    '.webm': Icon_Film,
    '.ogv': Icon_Film,
    // Audio
    '.mp3': Icon_VolumeUp,
    '.ogg': Icon_VolumeUp,
    '.wav': Icon_VolumeUp
}



import Viewer_Text from "./Viewers/TextViewer.svelte";
import Viewer_Image from "./Viewers/ImageViewer.svelte";
import Viewer_Video from "./Viewers/VideoViewer.svelte";
import Viewer_RPYC from "./Viewers/RPYCViewer.svelte";



export const default_viewer = Viewer_Text;

export const extension_viewers = {
    // Image
    '.png': Viewer_Image,
    '.gif': Viewer_Image,
    '.jpg': Viewer_Image,
    '.jpeg': Viewer_Image,
    '.webp': Viewer_Image,
    // Video
    '.mp4': Viewer_Video,
    '.mov': Viewer_Video,
    '.webm': Viewer_Video,
    '.ogv': Viewer_Video,
    // Ren'Py
    '.rpyc': Viewer_RPYC
}

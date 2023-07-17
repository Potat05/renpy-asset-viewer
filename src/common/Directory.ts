


// TODO: ../ functionality.
function resolvePath(...paths: string[]): string {
    let joined = '';

    // Format to unix path, I'm very sorry for this.
    for(let path of paths) {
        path = path.replace(/\\/g, '/');
        if(path.startsWith('/')) path = path.slice(1);
        if(path.endsWith('/')) path = path.slice(undefined, -1);

        // Is string like ../../text.txt
        // while(path.startsWith('../')) {
        //     while(path.startsWith('../')) {
        //         path = path.slice(3);
        //         joined = joined.slice(joined.lastIndexOf('/'));
        //     }
        // }
    
        if(joined.length == 0 || joined[joined.length-1] == '/') {
            joined += path;
        } else {
            joined += `/${path}`;
        }

    }

    return joined;
}



class Directory {
    /** Get file at path. */
    public getFile(path: string): Promise<Blob | undefined> {
        throw new Error(`Directory: Don't use this base class.`);
    }
    /** Get directory at path. */
    public getDirectory(path: string): Promise<Directory | undefined> {
        throw new Error(`Directory: Don't use this base class.`);
    }
    /** List entries in this directory. (Directories are suffixed with '/') */
    public listEntries(): Promise<string[]> {
        throw new Error(`Directory: Don't use this base class.`);
    }
}



class SubDirectory extends Directory {

    readonly directory: Directory;
    readonly path: string;

    constructor(directory: Directory, path: string) {
        super();
        this.directory = directory;
        this.path = path;
    }

    getFile(path: string): Promise<Blob | undefined> {
        return this.directory.getFile(resolvePath(this.path, path));
    }

    getDirectory(path: string): Promise<Directory | undefined> {
        return this.directory.getDirectory(resolvePath(this.path, path));
    }

    async listEntries(): Promise<string[]> {
        const dir = await this.directory.getDirectory(this.path);
        if(dir === undefined) {
            throw new Error('SubDirectory.listEntries: error.');
        }
        return await dir.listEntries();
    }

}



type FileList = {[key: string]: Blob};

type FolderStructure = {[key: string]: Blob | FolderObject_Directory};

class FolderObject_Directory extends Directory {

    folder: {[key: string]: Blob | FolderObject_Directory};

    constructor(folder: FolderStructure = {}) {
        super();
        this.folder = folder;
    }


    
    // TODO: Refactor this retarded shit.
    // I don't need to go through the whole path now that each sub folder is an actual class.



    async getFile(path: string): Promise<Blob | undefined> {

        const split = resolvePath(path).split('/');

        const filename = split.pop();
        if(filename === undefined) {
            throw new Error('FolderObject_Directory.getFile: Empty path.');
        }

        let folder: FolderObject_Directory = this;

        for(let i = 0; i < split.length; i++){
            const name = split[i];

            const entry = folder.folder[name];

            if(entry instanceof FolderObject_Directory) {
                folder = entry;
            } else {
                return undefined;
            }
        }

        const entry = folder.folder[filename];
        if(entry === undefined) return undefined;
        if(entry instanceof Directory) return undefined;
        return entry;

    }

    async getDirectory(path: string): Promise<Directory | undefined> {

        const split = resolvePath(path).split('/');

        const foldername = split.pop();
        if(foldername === undefined) {
            throw new Error('FolderObject_Directory.getDirectory: Empty path.');
        }

        let folder: FolderObject_Directory = this;

        for(let i = 0; i < split.length; i++){
            const name = split[i];

            const entry = folder.folder[name];

            if(entry instanceof FolderObject_Directory) {
                folder = entry;
            } else {
                return undefined;
            }
        }

        const entry = folder.folder[foldername];
        if(entry === undefined) return undefined;
        if(!(entry instanceof Directory)) return undefined;
        return entry;

    }

    async listEntries(): Promise<string[]> {

        let entries: string[] = [];

        for(const key in this.folder) {

            const entry = this.folder[key];

            if(entry === undefined) continue;

            if(entry instanceof Directory) {
                entries.push(`${key}/`);
            } else {
                entries.push(key);
            }

        }

        return entries;

    }



    static fromFileList(files: FileList) {
        
        const root = new this();

        for(const path in files) {
            let obj = root;

            const split = path.split('/');
            const filename = split.pop();
            if(filename === undefined) {
                throw new Error('FolderObject_Directory.fromFileList: Empty path.');
            }

            for(const name of split) {
                if(!(name in obj.folder)) obj.folder[name] = new this();
                const sub = obj.folder[name];
                if(!(sub instanceof Directory)) {
                    throw new Error('FolderObject_Directory.fromFileList: File and folder have same name.');
                }
                obj = sub;
            }

            obj.folder[filename] = files[path];
        }

        return root;

    }

}



export { resolvePath, Directory, SubDirectory, FolderObject_Directory };

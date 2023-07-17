
import { Directory, resolvePath } from "./Directory";



/**
 * From data transfer file system directory entry.  
 * (Am sorry for this name it's sorta unsightly.)  
 */
class FileSystemDirectoryEntry_Directory extends Directory {

    readonly directoryEntry: FileSystemDirectoryEntry;

    constructor(directoryEntry: FileSystemDirectoryEntry) {
        super();
        this.directoryEntry = directoryEntry;
    }

    getFile(path: string): Promise<Blob | undefined> {
        return new Promise((resolve, reject) => {

            this.directoryEntry.getFile(
                resolvePath(path),
                {
                    create: false,
                    exclusive: false
                },
                // File does exists.
                entry => {
                    if(entry.isFile) {
                        (entry as FileSystemFileEntry).file(
                            resolve,
                            reject // Error, File is maybe protected?
                        );
                    } else {
                        // This should never happen.
                        throw new Error('FileSystemDirectoryEntry_Directory.getFile: Error. File is not file...?');
                    }
                },
                // File doesn't exist.
                () => {
                    resolve(undefined);
                }
            );

        });

    }

    getDirectory(path: string): Promise<Directory | undefined> {
        return new Promise((resolve, reject) => {

            this.directoryEntry.getDirectory(
                resolvePath(path),
                {
                    create: false,
                    exclusive: false
                },
                // File does exists.
                entry => {
                    if(entry.isDirectory) {
                        resolve(new FileSystemDirectoryEntry_Directory(entry as FileSystemDirectoryEntry));
                    } else {
                        // This should never happen.
                        throw new Error('FileSystemDirectoryEntry_Directory.getDirectory: Error. Directory is not directory...?');
                    }
                },
                // File doesn't exist.
                () => {
                    resolve(undefined);
                }
            );

        });
    }

    listEntries(): Promise<string[]> {
        return new Promise(async (resolve, reject) => {

            // Reader can only read up to 100 entries at once.
            const reader = this.directoryEntry.createReader();

            let entries: FileSystemEntry[] = [];

            let readCount = 0;

            do {

                let read: FileSystemEntry[] = [];

                try {
                    read = await new Promise((res, rej) => {
                        reader.readEntries(res, rej);
                    });
                } catch(err) {
                    reject(err);
                }

                readCount = read.length;
                entries = entries.concat(read);

            } while(readCount > 0);



            resolve(entries.map(entry => `${entry.name}${entry.isDirectory ? '/' : ''}`));

        });
    }

}



export { FileSystemDirectoryEntry_Directory };

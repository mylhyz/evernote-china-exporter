declare module '@viperfe/evernote' {
    /* Classes */
    export class Client {
        constructor(config: {
            consumerKey?: string | undefined;
            consumerSecret?: string | undefined;
            sandbox?: boolean | undefined;
            china?: boolean | undefined;
            token?: string | undefined;
            serviceHost?: string | undefined;
        });
        getNoteStore(noteStoreUrl?: string): NoteStoreClient;
    }

    export class NoteStoreClient {
        listNotebooks(): Promise<Types.Notebook[]>;
    }

    export namespace Types {
        class Notebook {
            guid?: any | undefined;
            name?: string | undefined;
            updateSequenceNum?: number | undefined;
            defaultNotebook?: boolean | undefined;
            serviceCreated?: number | undefined;
            serviceUpdated?: number | undefined;
            publishing?: any | undefined;
            published?: boolean | undefined;
            stack?: string | undefined;
            sharedNotebookIds?: number[] | undefined;
            sharedNotebooks?: any[] | undefined;
            businessNotebook?: any | undefined;
            contact?: User | undefined;
            restrictions?: any | undefined;
            recipientSettings?: any | undefined;
        }
    }
}
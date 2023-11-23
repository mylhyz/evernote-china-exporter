const process = require("process");
const { Client, NoteStore } = require("evernote");

const runMain = async () => {
  const client = new Client({
    token: process.env.EVERNOTE_API_TOKEN,
    china: true,
    sandbox: false,
  });
  const noteStore = client.getNoteStore();
  noteStore.listNotebooks().then((notebooks) => {
    for(let notebook of notebooks){
        let filter = new NoteStore.NoteFilter();
        noteStore.findNotesMetadata()
    }
  });
};

runMain();

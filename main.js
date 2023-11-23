const process = require("process");
const { Client, NoteStore } = require("evernote");

const runMain = async () => {
  const client = new Client({
    token: process.env.EVERNOTE_API_TOKEN,
    china: true,
    sandbox: false,
  });
  const noteStore = client.getNoteStore();
  const notebooks = await noteStore.listNotebooks();
  for (let notebook of notebooks) {
    console.log("===", notebook.guid, notebook.name);
    let filter = new NoteStore.NoteFilter({
      notebookGuid: notebook.guid,
    });
    const metaList = await noteStore.findNotesMetadata(filter, 0, 100, {
      includeTitle: true,
    });
    for (let meta of metaList.notes) {
      console.log(meta.guid, meta.title);
    }
  }
};

runMain();

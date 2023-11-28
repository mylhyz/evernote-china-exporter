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
  const notebookDataArray = [];
  for (let notebook of notebooks) {
    // 保存笔记本数据
    const noteDataArray = [];
    
    let filter = new NoteStore.NoteFilter({
      notebookGuid: notebook.guid,
    });
    const metaList = await noteStore.findNotesMetadata(filter, 0, 200, {
      includeTitle: true,
    });
    for (let meta of metaList.notes) {
      console.log(meta.guid, meta.title);
      const note = await noteStore.getNoteWithResultSpec(meta.guid, {
        includeContent: true,
        includeResourcesData: true,
        includeResourcesRecognition: true,
        includeResourcesAlternateData: true,
        includeSharedNotes: true,
        includeNoteAppDataValues: true,
        includeResourceAppDataValues: true,
        includeAccountLimits: true,
      });
      console.log(note);
    }
    notebookDataArray.push({
      guid: notebook.guid,
      name: notebook.name,
    });
  }
};

runMain();

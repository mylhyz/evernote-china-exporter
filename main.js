const process = require("process");
const { Client, NoteStore } = require("evernote");
const fs = require("fs");

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
    let filter = new NoteStore.NoteFilter({
      notebookGuid: notebook.guid,
    });
    const metaList = await noteStore.findNotesMetadata(filter, 0, 300, {
      includeTitle: true,
    });
    console.log(`exporting notebooks... [${notebook.name}]`);
    console.log(
      `exporting ${metaList.notes.length} note for [${notebook.name}]`
    );
    const noteDataArray = [];
    for (let meta of metaList.notes) {
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
      fs.writeFileSync(
        `exported/note_${meta.guid}.json`,
        JSON.stringify(note, null, 2),
        { encoding: "utf-8" }
      );
      noteDataArray.push({
        guid: meta.guid,
        name: meta.name,
      });
      console.log(
        `exported ${meta.name} for [${notebook.name}]`
      );
    }
    notebookDataArray.push({
      guid: notebook.guid,
      name: notebook.name,
      array: noteDataArray,
    });
  }
  fs.writeFileSync(
    "exported/notebooks.json",
    JSON.stringify(notebookDataArray, null, 2),
    { encoding: "utf-8" }
  );
};

runMain();

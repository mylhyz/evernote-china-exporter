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
  let notebooks = [];
  try {
    notebooks = await noteStore.listNotebooks();
  } catch (e) {
    console.error("err-listNotebooks", e);
  }
  const notebookDataArray = [];
  for (let notebook of notebooks) {
    let filter = new NoteStore.NoteFilter({
      notebookGuid: notebook.guid,
    });
    let metaList;
    try {
      metaList = await noteStore.findNotesMetadata(filter, 0, 300, {
        includeTitle: true,
      });
    } catch (e) {
      console.error(
        `err-findNotesMetadata-${notebook.guid}-${notebook.name}`,
        e
      );
      continue;
    }
    console.log(`exporting notebooks... [${notebook.name}]`);
    console.log(
      `exporting ${metaList.notes.length} note for [${notebook.name}]`
    );
    const noteDataArray = [];
    for (let meta of metaList.notes) {
      let note;
      try {
        note = await noteStore.getNoteWithResultSpec(meta.guid, {
          includeContent: true,
          includeResourcesData: true,
          includeResourcesRecognition: true,
          includeResourcesAlternateData: true,
          includeSharedNotes: true,
          includeNoteAppDataValues: true,
          includeResourceAppDataValues: true,
          includeAccountLimits: true,
        });
      } catch (e) {
        console.error(
          `err-getNoteWithResultSpec-${meta.guid}-${meta.title}`,
          e
        );
      }
      fs.writeFileSync(
        `exported/note_${meta.guid}.json`,
        JSON.stringify(note, null, 2),
        { encoding: "utf-8" }
      );
      noteDataArray.push({
        guid: meta.guid,
        name: meta.title,
      });
      console.log(`exported ${meta.title} for [${notebook.name}]`);
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

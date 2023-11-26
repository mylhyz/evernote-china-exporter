const process = require("process");
const fs = require("fs");
const { Client, NoteStore } = require("evernote");

const runMain = async (notebookGuid) => {
  const client = new Client({
    token: process.env.EVERNOTE_API_TOKEN,
    china: true,
    sandbox: false,
  });
  const noteStore = client.getNoteStore();
  let filter = new NoteStore.NoteFilter({
    notebookGuid,
  });
  const metaList = await noteStore.findNotesMetadata(filter, 0, 100, {
    includeTitle: true,
  });
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
    const data = JSON.stringify(note, null, 2);
    fs.writeFileSync(`note_${note.guid}.json`, data, { encoding: "utf-8" });
  }
};

const argv = process.argv;

runMain(argv[2]);

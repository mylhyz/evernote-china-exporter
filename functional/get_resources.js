const process = require("process");
const fs = require("fs");
const { Client, NoteStore } = require("evernote");

const runMain = async (resourceGuid) => {
  const client = new Client({
    token: process.env.EVERNOTE_API_TOKEN,
    china: true,
    sandbox: false,
  });
  const noteStore = client.getNoteStore();
  const resource = await noteStore.getResource(
    resourceGuid,
    true,
    true,
    true,
    true
  );
  const data = JSON.stringify(resource, null, 2);
  fs.writeFileSync(`res_${resource.guid}.json`, data, { encoding: "utf-8" });
};

const argv = process.argv;

runMain(argv[2]);

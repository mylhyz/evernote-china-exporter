const process = require("process");
const { Client } = require("@viperfe/evernote");

const runMain = async () => {
  const client = new Client({
    token: process.env.EVERNOTE_API_TOKEN,
    china: true,
    sandbox: false,
  });
  const noteStore = client.getNoteStore();
  noteStore.listNotebooks().then((notebooks) => {
    console.log(notebooks);
  });
};

runMain();

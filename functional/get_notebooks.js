// 获取所有的笔记本信息

const process = require("process");
const fs = require("fs");
const { Client, NoteStore } = require("evernote");

const runMain = async () => {
  const client = new Client({
    token: process.env.EVERNOTE_API_TOKEN,
    china: true,
    sandbox: false,
  });
  const noteStore = client.getNoteStore();
  const notebooks = await noteStore.listNotebooks();
  const data = JSON.stringify(notebooks, null, 2);
  fs.writeFileSync("notebooks.json", data, { encoding: "utf-8" });
};

runMain();

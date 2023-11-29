const fs = require("fs");
const path = require("path");
const TurndownService = require("@joplin/turndown");
const flow = require("xml-flow");
const { Readable } = require("stream");

const EXPORTED_FOLDER = ".exported-cache";

const mkdirSafe = (dir) => {
  if (fs.existsSync(dir)) {
    if (!fs.lstatSync(dir).isDirectory()) {
      throw Error(`${dir} is not a folder`);
    }
  } else {
    fs.mkdirSync(dir);
  }
};

async function onNotebooks(context) {
  context._md_map = {};
  //创建所有文件夹
  const root = path.join(__dirname, EXPORTED_FOLDER);
  mkdirSafe(root);
  for (let notebook of context.notebooks) {
    const folder = path.join(root, notebook.name);
    mkdirSafe(folder);
    for (let note of notebook.array) {
      const name = note.name.replaceAll("/", "-");
      const file = path.join(folder, `${name}.md`);
      //给每一个创建笔记文件创建guid关联
      context._md_map[note.guid] = file;
    }
  }
}

async function convert(note, file) {
  return new Promise((resolve, reject) => {
    const logAndReject = (error) => {
      reject(error);
    };
    const stream = Readable.from([note.content]);
    const xml = flow(stream);
    xml.on('tag:en-note',(data)=>{
      console.log(data);
    })
    xml.on("end", () => {
      resolve();
    });
    xml.on("error", logAndReject);
    stream.on("error", logAndReject);
  });
}

async function onNotes(context) {
  for (let note of context.notes) {
    await convert(note, context._md_map[note.guid]);
  }
}

module.exports = {
  onNotebooks,
  onNotes,
};

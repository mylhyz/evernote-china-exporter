const fs = require("fs");
const path = require("path");
const flow = require("xml-flow");
const { Readable } = require("stream");
const Mustache = require("mustache");

const EXPORTED_FOLDER = ".exported-html-cache";

const mkdirSafe = (dir) => {
  if (fs.existsSync(dir)) {
    if (!fs.lstatSync(dir).isDirectory()) {
      throw Error(`${dir} is not a folder`);
    }
  } else {
    fs.mkdirSync(dir);
  }
};

const findGenerator = (data) => {
  const keys = Object.keys(data);
  const keysSize = keys.length;
  if (keysSize == 1 && data["$name"] && data["$name"] == "div") {
    return () => {
      return "<br/>";
    };
  } else if (
    keysSize == 2 &&
    data["$name"] &&
    data["$name"] == "div" &&
    data["$text"]
  ) {
    return () => {
      return "<p>" + data["$text"] + "</p>";
    };
  } else if (
    keysSize == 3 &&
    data["$name"] &&
    data["$name"] == "div" &&
    data["en-todo"] &&
    data["$text"]
  ) {
    const checked = data["en-todo"] == "false" ? "" : " checked";
    return () => {
      return `<input type="checkbox"${checked}></input>${data["$text"]}`;
    };
  }
};

const generate = (data) => {
  const generator = findGenerator(data);
  if (generator) {
    return generator();
  }
  console.log(data);
  return "<div></div>";
};

async function onNotebooks(context) {
  context._html_map = {};
  //创建所有文件夹
  const root = path.join(__dirname, EXPORTED_FOLDER);
  mkdirSafe(root);
  for (let notebook of context.notebooks) {
    const folder = path.join(root, notebook.name);
    mkdirSafe(folder);
    for (let note of notebook.array) {
      const name = note.name.replaceAll("/", "-");
      const file = path.join(folder, `${name}.html`);
      //给每一个创建笔记文件创建guid关联
      context._html_map[note.guid] = file;
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
    const note_bodys = [];
    xml.on("tag:div", (data) => {
      note_bodys.push(generate(data));
    });
    xml.on("end", () => {
      //组装html文件
      const template = fs.readFileSync("templates/index.html", {
        encoding: "utf-8",
      });
      const result = Mustache.render(template, {
        note_title: note.name,
        note_bodys,
      });
      fs.writeFileSync(file, result, { encoding: "utf-8" });
      resolve();
    });
    xml.on("error", logAndReject);
    stream.on("error", logAndReject);
  });
}

async function onNotes(context) {
  let count = 1;
  for (let note of context.notes) {
    if (count > 1) {
      break;
    }
    count = count + 1;
    await convert(note, context._html_map[note.guid]);
  }
}

module.exports = {
  onNotebooks,
  onNotes,
};

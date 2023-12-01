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

const genText = (text) => {
  if (!text) {
    return "";
  }
  return text;
};

const genAttrs = (attrs) => {
  let attr_str = "";
  for (let _key of Object.keys(attrs)) {
    attr_str = `${attr_str} ${_key}="${attrs[_key]}"`;
  }
  return attr_str;
};

const gen = (data) => {
  if (data["$name"] == "div") {
    let keys = Object.keys(data);
    // 特殊情况 <br/>
    if (keys.length == 1) {
      return "<div><br/></div>";
    }
    // 特殊情况的div，只有style
    if (keys.length == 2 && data["style"]) {
      return `<div style="${data["style"]}"><br/></div>`;
    }
    // 正常处理
    let attr_str = "";
    let element = "";
    let text_str = "";
    for (let key of keys) {
      if (key == "$name") {
        continue;
      } else if (key == "$attrs") {
        attr_str = genAttrs(data["$attrs"]);
      } else if (key == "$text") {
        text_str = genText(data["$text"]);
      } else if (key == "en-todo") {
        const checked = data["en-todo"] == "false" ? "" : " checked";
        const todo = `<input type="checkbox"${checked}/>`;
        element = `${element}${todo}`;
      } else if (key == "span") {
        if (data["span"]["$name"]) {
          throw Error(`error 1`);
        }
        data["span"]["$name"] = "span";
        const span = gen(data["span"]);
        element = `${element}${span}`;
      } else if (key == "img") {
        if (data["img"]["$name"]) {
          throw Error(`error 1`);
        }
        data["img"]["$name"] = "img";
        const img = gen(data["img"]);
        element = `${element}${img}`;
      } else if (key == "en-media") {
        if (data["en-media"]["$name"]) {
          throw Error(`error 1`);
        }
        data["en-media"]["$name"] = "en-media";
        const media = gen(data["en-media"]);
        element = `${element}${media}`;
      } else {
        console.log(`[ERR][DIV]${data[key]}`);
        throw Error(`[DIV]${key} is not processed`);
      }
    }
    return `<div${attr_str}>${element}${text_str}</div>`;
  } else if (data["$name"] == "span") {
    let keys = Object.keys(data);
    let attr_str = "";
    let element = "";
    let text_str = "";
    for (let key of keys) {
      if (key == "$name") {
        continue;
      } else if (key == "$attrs") {
        attr_str = genAttrs(data["$attrs"]);
      } else if (key == "$text") {
        text_str = genText(data["$text"]);
      } else if (key == "a") {
        if (data["a"]["$name"]) {
          throw Error(`error 1`);
        }
        data["a"]["$name"] = "a";
        const a = gen(data["a"]);
        element = `${element}${a}`;
      } else if (key == "en-media") {
        if (data["en-media"]["$name"]) {
          throw Error(`error 1`);
        }
        data["en-media"]["$name"] = "en-media";
        const media = gen(data["en-media"]);
        element = `${element}${media}`;
      } else {
        console.log(`[ERR][SPAN]${data[key]}`);
        throw Error(`[SPAN]${key} is not processed`);
      }
    }
    return `<span${attr_str}>${element}${text_str}</span>`;
  } else if (data["$name"] == "a") {
    let keys = Object.keys(data);
    let attr_str = "";
    let text_str = "";
    for (let key of keys) {
      if (key == "$name") {
        continue;
      } else if (key == "$attrs") {
        attr_str = genAttrs(data["$attrs"]);
      } else if (key == "$text") {
        text_str = genText(data["$text"]);
      } else {
        console.log(`[ERR][A]${data[key]}`);
        throw Error(`[A]${key} is not processed`);
      }
    }
    return `<a${attr_str}>${text_str}</a>`;
  }
  console.log(`[ERROR]${data}`);
  return "<error></error>";
};

const generate = (data) => {
  const ret = gen(data);
  console.log(`[OUTPUT] ${ret}`);
  return ret;
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
      const name = note.name.replaceAll("/", "_");
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
        note_title: note.title,
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
    if (count > 3) {
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

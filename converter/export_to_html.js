const fs = require("fs");
const path = require("path");
var converter = require("xml-js");
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

const genAttrs = (attrs) => {
  if (!attrs) {
    return "";
  }
  let attr_str = "";
  for (let _key of Object.keys(attrs)) {
    //属性值对双引号进行转义
    let v = attrs[_key];
    v = v.replaceAll('"', "&quot;");
    attr_str = `${attr_str} ${_key}="${v}"`;
  }
  return attr_str;
};

const gen = (data) => {
  if (data.type == "element") {
    if (
      data.name == "div" ||
      data.name == "span" ||
      data.name == "a" ||
      data.name == "img" ||
      data.name == "u" ||
      data.name == "h1" ||
      data.name == "h2" ||
      data.name == "h3" ||
      data.name == "h4" ||
      data.name == "h5" ||
      data.name == "p" ||
      data.name == "pre" ||
      data.name == "code" ||
      data.name == "s" ||
      data.name == "ul" ||
      data.name == "li" ||
      data.name == "ol" ||
      data.name == "b" ||
      data.name == "i" ||
      data.name == "table" ||
      data.name == "col" ||
      data.name == "colgroup" ||
      data.name == "tbody" ||
      data.name == "tr" ||
      data.name == "td" ||
      data.name == "font" ||
      data.name == "strong" ||
      data.name == "strike" ||
      data.name == "center" ||
      data.name == "dl" ||
      data.name == "dt" ||
      data.name == "dd" ||
      data.name == "blockquote" ||
      data.name == "en-media"
    ) {
      // 处理 attributes
      let attr_str = genAttrs(data.attributes);
      let elements = "";
      // 处理 elements
      if (data.elements) {
        for (let ele of data.elements) {
          const ge = gen(ele);
          elements = `${elements}${ge}`;
        }
      } else {
        // 特殊处理一种情况
        if (data.name == "span") {
          elements = "&nbsp;&nbsp;";
        }
      }
      return `<${data.name}${attr_str}>${elements}</${data.name}>`;
    } else if (data.name == "br") {
      return "<br/>";
    } else if (data.name == "en-todo") {
      const checked =
        data.attributes && data.attributes["checked"] ? " checked" : "";
      return `<input type="checkbox"${checked}/>`;
    } else {
      throw Error(`name ${data.name} ???`);
    }
  } else if (data.type == "text") {
    return data.text;
  } else {
    throw Error(`type ${data.type} ???`);
  }
};

const generate = (data) => {
  const lines = data["elements"][1]["elements"];
  if (!lines) {
    return [];
  }
  const bodys = [];
  for (let line of lines) {
    bodys.push(gen(line));
  }
  return bodys;
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
  const obj = converter.xml2js(note.content);
  const note_bodys = generate(obj);
  if (note_bodys.length == 0) {
    console.warn(`${note.title} is empty body`);
  }

  //组装html文件
  const template = fs.readFileSync("templates/index.html", {
    encoding: "utf-8",
  });
  const result = Mustache.render(template, {
    note_title: note.title,
    note_bodys,
  });

  fs.writeFileSync(file, result, { encoding: "utf-8" });
}

async function onNotes(context) {
  for (let note of context.notes) {
    await convert(note, context._html_map[note.guid]);
  }
}

module.exports = {
  onNotebooks,
  onNotes,
};

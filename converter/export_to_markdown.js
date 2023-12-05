const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const converter = require("xml-js");
const Mustache = require("mustache");
const TurndownService = require("@joplin/turndown");
const turndownPluginGfm = require("@joplin/turndown-plugin-gfm");
const gfm = turndownPluginGfm.gfm;
const turndownService = new TurndownService();
turndownService.use(gfm);

const EXPORTED_FOLDER = ".exported-markdown-cache";
const EXPORTED_MEDIA_FOLDER = "media";

const mkdirSafe = (dir) => {
  if (fs.existsSync(dir)) {
    if (!fs.lstatSync(dir).isDirectory()) {
      throw Error(`${dir} is not a folder`);
    }
  } else {
    fs.mkdirSync(dir);
  }
};

const getMediaSuffix = (mine) => {
  return mine.slice(mine.indexOf("/") + 1);
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
      data.name == "blockquote"
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
      let checked = "";
      if (data.attributes && data.attributes["checked"]) {
        checked = checked;
      }
      return `<input type="checkbox"${checked}/>`;
    } else if (data.name == "en-media") {
      const suffix = getMediaSuffix(data.attributes.type);
      const hash = data.attributes.hash;
      delete data.attributes.type;
      delete data.attributes.hash;
      data.attributes.src = `${EXPORTED_MEDIA_FOLDER}/${hash}.${suffix}`;
      let attr_str = genAttrs(data.attributes);
      return `<img${attr_str}></img>`;
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
  context._markdown_map = {};
  context._media_map = {};
  //创建所有文件夹
  const root = path.join(__dirname, EXPORTED_FOLDER);
  mkdirSafe(root);
  for (let notebook of context.notebooks) {
    const folder = path.join(root, notebook.name);
    mkdirSafe(folder);
    const mediaFolder = path.join(folder, EXPORTED_MEDIA_FOLDER);
    for (let note of notebook.array) {
      const name = note.name.replaceAll("/", "_");
      const file = path.join(folder, `${name}.md`);
      //给每一个创建笔记文件创建guid关联
      context._markdown_map[note.guid] = file;
      context._media_map[note.guid] = mediaFolder;
    }
  }
}

async function convert(note, file, media) {
  // 处理media文件
  if (note.resources && Array.isArray(note.resources)) {
    for (let resource of note.resources) {
      const mimeType = resource.mime;
      const suffix = getMediaSuffix(mimeType);
      const bf = Buffer.from(resource.data.body.data);
      const hashV = crypto.createHash("md5").update(bf).digest("hex");
      mkdirSafe(media);
      fs.writeFileSync(`${media}/${hashV}.${suffix}`, bf);
    }
  }

  // 处理笔记本体
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

  const markdown = turndownService.turndown(result);

  fs.writeFileSync(file, markdown, { encoding: "utf-8" });
}

async function onNotes(context) {
  for (let note of context.notes) {
    await convert(
      note,
      context._markdown_map[note.guid],
      context._media_map[note.guid]
    );
  }
}

module.exports = {
  onNotebooks,
  onNotes,
};

const fs = require("fs");
const path = require("path");

const html = require("./export_to_html");
const markdown = require("./export_to_markdown");
const logger = require("./export_to_logger");
const walkers = [html, markdown, logger];
const runWalk = async (context) => {
  for (let walker of walkers) {
    await walker.onNotebooks(context);
    await walker.onNotes(context);
  }
};

const runMain = async (argv) => {
  if (argv.length != 1) {
    console.error("wrong usage!");
    process.exit(1);
  }
  const dp = argv[0];
  if (!fs.existsSync(dp)) {
    console.error(`${dp} is not exist.`);
    process.exit(1);
  }
  if (!fs.lstatSync(dp).isDirectory()) {
    console.error(`${dp} is not a folder.`);
    process.exit(1);
  }
  const fps = fs.readdirSync(dp);
  let context = {
    notebooks: [],
    notes: [],
  };
  for (let _fp of fps) {
    if (_fp.indexOf(".synced-notes.json") !== -1) {
      continue;
    }
    if (_fp.indexOf(".gitkeep") !== -1) {
      continue;
    }
    const fp = path.join(dp, _fp);
    const content = fs.readFileSync(fp, { encoding: "utf-8" });
    const json = JSON.parse(content);
    if (_fp.indexOf("notebooks.json") == -1) {
      context.notes.push(json);
    } else {
      context.notebooks = json;
    }
  }
  runWalk(context);
};

const argv = process.argv;

runMain(argv.slice(2));

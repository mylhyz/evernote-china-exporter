const fs = require("fs");
// const path = require("path");

const runMain = async (fp) => {
  const content = fs.readFileSync(fp, { encoding: "utf-8" });
  const note = JSON.parse(content);
  fs.writeFileSync("note.xml", note.content, { encoding: "utf-8" });
};

const argv = process.argv;
runMain(argv[2]);

const fs = require("fs");
const path = require("path");

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
  for (let _fp of fps) {
    const fp = path.join(dp, _fp);
    const content = fs.readFileSync(fp, { encoding: "utf-8" });
    const json = JSON.parse(content);
    // 处理数据 TODO
  }
};

const argv = process.argv;

runMain(argv.slice(2));

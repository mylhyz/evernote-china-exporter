const fs = require("fs");
const process = require("process");
var crypto = require('crypto');

const runMain = async (fp) => {
  const content = fs.readFileSync(fp, { encoding: "utf-8" });
  const note = JSON.parse(content);
  if (
    note["resources"] &&
    note["resources"][0]["data"] &&
    note["resources"][0]["data"]["body"] &&
    note["resources"][0]["data"]["body"]["data"]
  ) {
    const bf = Buffer.from(note["resources"][0]["data"]["body"]["data"])
    fs.writeFileSync("a.png",bf);
    const hashV = crypto.createHash('md5').update(bf).digest("hex");
    console.log(hashV)
  }
};

const argv = process.argv;

runMain(argv[2]);

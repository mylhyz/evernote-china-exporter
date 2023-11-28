const fs = require("fs");

const runMain = async () => {
  const list = fs.readdirSync("exported/");
  const synced = {};
  list.forEach((item) => {

    if (item.startsWith("note_")) {
      synced[item.slice(5).slice(0,36)] = 1;
    }
  });
  fs.writeFileSync(
    "exported/.synced-notes.json",
    JSON.stringify(synced, null, 2),
    { encoding: "utf-8" }
  );
};

runMain();

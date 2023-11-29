async function onNotebooks(context) {
  if (!process.env.LOG_ENABLE) {
    return;
  }
  console.log(`[INFO] === notebooks ===`);
  for (let notebook of context.notebooks) {
    console.log(`[INFO] === ${notebook.name}`);
    for (let note of notebook.array) {
      console.log(`[INFO] === === ${note.name}`);
    }
  }
}
async function onNotes(context) {}

module.exports = {
  onNotebooks,
  onNotes,
};

async function onNotebooks(context) {
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

import fs from 'fs/promises'

const FILE_PATH = './store.json'
let db = {}

// Initialize DB (read from file or create empty)
export async function init() {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8')
    db = JSON.parse(data)
  } catch (err) {
    if (err.code === 'ENOENT') {
      db = {}
      await write()
    } else {
      throw err
    }
  }
}

async function write() {
  await fs.writeFile(FILE_PATH, JSON.stringify(db, null, 2))
}

// Add msgId to userId
export async function add(userId, msgId) {
  if (!db[userId]) {
    db[userId] = []
  }
  db[userId].push(msgId)
  await write()
}

// Delete msgId from userId
export async function del(userId, msgId) {
  if (!db[userId]) return
  db[userId] = db[userId].filter(id => id !== msgId)
  if (db[userId].length === 0) delete db[userId]
  await write()
}


export default { init, add, del }

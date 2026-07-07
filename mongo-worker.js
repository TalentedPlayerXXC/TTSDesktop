const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
  name: String,
  gender: String,
  voiceType: String,
  temperament: String,
  ref_audio: String,
}, { collection: 'characters' })

const tagSchema = new mongoose.Schema({
  label: String,
  enum: String,
}, { collection: 'tags' })

const Character = mongoose.model('Character', characterSchema)
const Tag = mongoose.model('Tag', tagSchema)

function send(data) {
  process.send?.(data)
}

async function handleMessage(msg) {
  switch (msg.type) {
    case 'connect':
      try {
        await mongoose.connect(msg.uri)
        send({ ...msg, status: 'ok' })
      } catch (err) {
        send({ ...msg, status: 'error', error: err.message })
      }
      break

    case 'disconnect':
      try {
        await mongoose.disconnect()
        send({ ...msg, status: 'ok' })
      } catch (err) {
        send({ ...msg, status: 'error', error: err.message })
      }
      break

    case 'getCharacters':
      try {
        const docs = await Character.find({})
        send({ ...msg, status: 'ok', data: docs })
      } catch (err) {
        send({ ...msg, status: 'error', error: err.message })
      }
      break

    case 'getTags':
      try {
        const docs = await Tag.find({})
        send({ ...msg, status: 'ok', data: docs })
      } catch (err) {
        send({ ...msg, status: 'error', error: err.message })
      }
      break

    default:
      send({ ...msg, status: 'error', error: `Unknown message type: ${msg.type}` })
  }
}

process.on('message', handleMessage)

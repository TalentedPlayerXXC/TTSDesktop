const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const MONGODB_URI = require('../db').MONGODB_URI
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'characters.json')

const characterSchema = new mongoose.Schema({}, { strict: false })
const Character = mongoose.model('Character', characterSchema, 'characters')
const tagSchema = new mongoose.Schema({}, { strict: false })
const Tag = mongoose.model('Tag', tagSchema, 'tags')

async function main() {
  console.log('[export] 连接 MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('[export] 已连接，拉取角色数据...')

  const docs = await Character.find({}).lean()
  const tagDocs = await Tag.find({}).lean()
  console.log(`[export] 拉取完成，共 ${docs.length} 个角色，${tagDocs.length} 个标签`)

  // 标准化字段
  const characters = docs.map(d => ({
    id: d._id.toString(),
    name: d.name || '',
    game: d.game || '',
    gender: d.gender || '未知',
    voiceType: d.voiceType || '',
    temperament: d.temperament || '',
    desc: d.desc || '',
  }))

  const tags = tagDocs.map(d => ({
    id: d._id.toString(),
    label: d.label || '',
    enum: d.enum || '',
  }))

  const output = { characters, tags }

  const dir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`[export] 已保存到 ${OUTPUT_PATH}`)

  await mongoose.disconnect()
  console.log('[export] 完成')
  process.exit(0)
}

main().catch(err => {
  console.error('[export] 失败:', err.message)
  process.exit(1)
})

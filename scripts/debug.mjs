import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'

const html = readFileSync('migration-source/englishcenter.kl.edu.tw/englishcenter.kl.edu.tw/news/49.html', 'utf-8')
const $ = cheerio.load(html)

console.log('h2 small:', $('h2 small').text().trim())
console.log('card-body exists:', $('.card-body').length > 0)
console.log('card-body html:', $('.card-body').html()?.slice(0, 300))
console.log('card-footer text:', $('.card-footer').text().slice(0, 200))

const cheerio = require('cheerio') // 1
const axios = require('axios') // 1
const base_url = 'https://www.columbiacommunityconnection.com'

function parseHTML(html, selector) {
  const $ = cheerio.load(html)
  let posts = []
  $(selector).map(function () {
    let post = {
      title: $(this).find('title').text(),
      html: $(this).html(),
    }
    posts.push(post)
  })
  return posts
}

async function scrapeData() {
  try {
    const { data } = await axios.get(`${base_url}/death-notices-and-obituaries?format=rss`)
    return parseHTML(data, 'item')
  } catch (err) {
    console.error(err)
  }
}

export default async (req, res) => {
  if (req.method === 'GET') {
    try {
      res.statusCode = 200
      return res.json(await scrapeData())
    } catch (e) {
      res.statusCode = 404
      return res.json(e)
    }
  }
}

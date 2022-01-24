const cheerio = require('cheerio')
const { request } = require('./request')
const fs = require('fs')

// 文章列表
const articles = []

//获取文章链接
async function getArticleLinks(params) {
  const { data } = await request({
    methods: 'GET',
    url: '/',
    params: {
      page: params.page || 1,
      tab: 'all',
    },
  })
  const $ = cheerio.load(data)

  $('a.topic_title').each((index, item) => {
    const aLink = $(item)
    articles.push({
      title: aLink.html().trim(),
      url: aLink.attr('href'),
    })
  })

  // console.log(articles.length)
  //让当前页码 + 1
  const paginations = $('.pagination li')
  const hasNextPage = paginations
    .eq(paginations.length - 1)
    .hasClass('disabled')

  if (hasNextPage) {
    //递归请求下一页数据
    await getArticleLinks({
      page: params.page + 1,
    })
  }
}

//获取文章内容
async function getArticleContent(url) {
  const { data } = await request({
    methods: 'GET',
    url,
  })
  const $ = cheerio.load(data)
  const content = $('.markdown-text').html()
  return content
}

async function main() {
  try {
    await getArticleLinks({
      page: 1, //从 第 1 页开始抓起
    })
    // console.log(articles)
    fs.writeFileSync('./data.json', JSON.stringify(articles))

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      console.log(article.url)
      article.content = await getArticleContent(article.url)
      fs.writeFileSync(
        `./docs/${i}.txt`,
        `
    标题：${article.title}

    正文内容：
    ${article.content}
    `
      )
      console.log(article.title + ' 抓取保存成功')
    }
  } catch (error) {
    console.log('抓取文章失败',error)
  }
}

//主函数
main()

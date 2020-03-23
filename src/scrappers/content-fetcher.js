const fetchLinks = require('./link-crawler')
const Mercury = require('@postlight/mercury-parser')
const htmlToText = require('html-to-text')
const logger = require('../config/logger')

module.exports = {
	fetchArticles: async function(maxArticles = 1) {
		const sourceConfigs = this.getConfigs()
		let { articleLinks } = await fetchLinks(sourceConfigs)

		articleLinks = articleLinks.slice(0, maxArticles)

		let articles = []
		for (const articleLink of articleLinks) {
			try {
				const article = await this.scrapeArticleLink(articleLink.articleUrl)
				article.status = 'scraped'
				article.source = articleLink.source

				if (article.contentText.length > 200) articles.push(article)
			} catch (reason) {
				logger.info('Printing reason', reason)
			}
		}

		return { articles: articles }
	},

	scrapeArticleLink: async function(url) {
		return new Promise((resolve, reject) => {
			Mercury.parse(url)
				.then((result) => {
					result.contentText = htmlToText.fromString(result.content).replace(/\[[^\]]*\]/g, '')
					resolve(result)
				})
				.catch((reason) => {
					reject(reason)
				})
		})
	},

	getConfigs: function() {
		return require('../scrappers/config/source-configs.json')
	}
}

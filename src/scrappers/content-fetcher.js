import fetchLinks from './link-crawler'
import Mercury from '@postlight/mercury-parser'
import htmlToText from 'html-to-text'

export default {
	fetchArticles: async function() {
		const config = this.getConfig('medium')
		let { links } = await fetchLinks(config)
		links = links.slice(0, 10)

		let articles = []
		for (const link of links) {
			const article = await this.scrapeArticleLink(link)
			articles.push(article)
		}

		return { articles: articles }
	},

	scrapeArticleLink: async function(url) {
		return new Promise((resolve, reject) => {
			Mercury.parse(url)
				.then(result => {
					result.contentText = htmlToText.fromString(result.content)
					resolve(result)
				})
				.catch(reason => {
					console.log('Printing reason', reason)
					reject(reason)
				})
		})
	},

	getConfig: function(source) {
		switch (source) {
			case 'medium':
				return require('./config/medium-config.json')
			default:
				break
		}
	}
}
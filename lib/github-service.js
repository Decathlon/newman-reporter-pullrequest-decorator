const { Octokit } = require('@octokit/rest');
const { buildMarkdownText } = require('./utils');

const hasCollectionSucceed = (assertions) => assertions.failed_count === 0;

/**
 * Service responsible of calling Github and create the check containing postman collection results.
 */
class GithubService {
  constructor(options) {
    this.options = options;
  }

  createPullRequestCheck(report) {
    const { assertions, items } = report;
    return this.getOctokitInstance(this.options.token).rest.checks.create({
      owner: this.options.repo.split('/')[0],
      repo: this.options.repo.split('/')[1],
      name: this.options.checkName ? this.options.checkName : 'newman-check',
      head_sha: this.options.refCommit,
      conclusion: hasCollectionSucceed(assertions) ? 'success' : 'failure',
      output: {
        title: 'NRT execution results',
        summary: hasCollectionSucceed(assertions)
          ? ":trophy: NRT passed : You're good to go !"
          : ":boom: NRT failed : I wouldn't deploy that if I were you !",
        text: buildMarkdownText(items),
      },
    });
  }

  getOctokitInstance() {
    return new Octokit({ auth: this.options.token });
  }
}

module.exports = GithubService;

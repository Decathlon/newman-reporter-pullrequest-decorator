const { Octokit } = require('@octokit/rest');
const { buildMarkdownText, buildPullRequestComment } = require('./utils');

const hasCollectionSucceed = (assertions) => assertions.failed_count === 0;

const getAssociatedPullRequestNumberFromSha = async (octokit,repository, commitSha) => {
  return octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
    owner: repository.split('/')[0],
    repo: repository.split('/')[1],
    commit_sha: commitSha,
  });
}

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

  async createPullRequestComment(report){
    const res = await getAssociatedPullRequestNumberFromSha(this.getOctokitInstance(), this.options.repo, this.options.refCommit);
    if (res.data.length == 0){
      console.log("[+] No pull request associated with commit sha")
      return; 
    }

    return await this.getOctokitInstance().request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: this.options.repo.split('/')[0],
      repo: this.options.repo.split('/')[1],
      issue_number: res.data[0].number,
      body:  buildPullRequestComment(report),
    })
  }

  getOctokitInstance() {
    return new Octokit({ auth: this.options.token });
  }
}

module.exports = GithubService;

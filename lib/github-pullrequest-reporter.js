/* eslint-disable no-console */

const GithubService = require('./github-service');
const utils = require('./utils');

const buildOptions = (reporterOptions, newmanOptions) => {
  reporterOptions.debug && console.log('[+] Reporter Options', reporterOptions);

  // Github parameters are only required in non export mode.
  if (!reporterOptions.export) {
    if (!reporterOptions.githubPullrequestRepo) {
      throw new Error('[-] ERROR: Github PullRequest Repository name is missing ! Add --reporter-github-pullrequest-repo <repo>.');
    }

    if (!reporterOptions.githubPullrequestRefcommit) {
      throw new Error('[-] ERROR: Github PullRequest Ref commit is missing ! Add --reporter-github-pullrequest-refcommit <refcommit>.');
    }

    if (!reporterOptions.githubPullrequestToken) {
      throw new Error('[-] ERROR: Github PullRequest Token is missing ! Add --reporter-github-pullrequest-token <token>.');
    }
  }

  return {
    repo: reporterOptions.githubPullrequestRepo,
    refCommit: reporterOptions.githubPullrequestRefcommit,
    checkName: reporterOptions.githubPullrequestCheckname,
    token: reporterOptions.githubPullrequestToken,
    export: reporterOptions.export,
    collectionName: newmanOptions.collection.name,
    debug: reporterOptions.debug,
  };
};

const buildEmptyItem = () => ({
  failed: [],
  skipped: [],
});

const buildEmptyContext = () => ({
  currentItem: buildEmptyItem(),
  assertions: {
    failed_count: 0,
    skipped_count: 0,
  },
  list: [],
});

class GithubPullRequestReporter {
  constructor(newmanEmitter, reporterOptions, newmanOptions) {
    this.newmanEmitter = newmanEmitter;
    this.options = buildOptions(reporterOptions, newmanOptions);
    this.context = buildEmptyContext();
    this.githubService = new GithubService(this.options);

    'start beforeItem request assertion beforeDone done'.split(' ')
      .forEach((e) => { if (typeof this[e] === 'function') newmanEmitter.on(e, (err, args) => this[e](err, args)); });
  }

  start() {
    console.log(`[+] Starting collection: ${this.options.collectionName} `);
    this.options.debug && console.log(`with following context :${JSON.stringify(this.options)}`);
  }

  // eslint-disable-next-line class-methods-use-this
  beforeItem(error, args) {
    console.log(`Running ${args.item.name}`);
    console.log(`Running ${args.item.id}`);
  }

  request(error, args) {
    const { item, request, response } = args;

    this.context.currentItem = buildEmptyItem();
    this.context.currentItem.id = item.id;
    this.context.currentItem.request_name = item.name;
    this.context.currentItem.url = request.url.toString();
    this.context.currentItem.method = request.method;

    if (error) {
      this.context.currentItem.test_status = 'FAIL';
      this.context.currentItem.body = error.code;
    } else if (response) {
      this.context.currentItem.status = response.status;
      this.context.currentItem.body = response.stream.toString();
      this.context.currentItem.code = response.code;
      this.context.currentItem.test_status = 'PASS';
    }
    this.context.list.push(this.context.currentItem);
  }

  assertion(error, args) {
    if (error) {
      this.context.currentItem.test_status = 'FAIL';
      this.context.currentItem.failed.push(`${error.test} , ${error.name} , ${error.message}`);
      this.context.assertions.failed_count += 1;
    } else if (args.skipped) {
      if (this.context.currentItem.test_status !== 'FAIL') {
        this.context.currentItem.test_status = 'SKIP';
      }
      this.context.currentItem.skipped.push(args.assertion);
      this.context.assertions.skipped_count += 1;
    }
  }

  beforeDone(error, args) {
    if (this.options.export) {
      this.newmanEmitter.exports.push({
        name: 'github-pullrequest-reporter',
        default: 'newman-run-report.md',
        path: this.options.export,
        content: utils.buildMarkdownText(this.buildItemsReport(args.summary.collection.items)),
      });
    }
  }

  done(error, summary) {
    if (!this.options.export) {
      return this.githubService.createPullRequestCheck(
        this.buildReport(this.context.assertions, summary.collection.items),
        this.options,
      )
        .catch((exception) => { console.error(`[+] An error occured : ${exception}`); })
        .finally(() => {
          console.log(`[+] Finished collection: ${this.options.collectionName}`);
        });
    }
    return Promise.resolve();
  }

  buildReport(assertions, items) {
    return {
      assertions,
      items: this.buildItemsReport(items),
    };
  }

  buildItemsReport(items) {
    return items.map((collectionItem) => {
      if (collectionItem.items) {
        return {
          name: collectionItem.name,
          subItems: this.buildItemsReport(collectionItem.items),
        };
      }
      return this.context.list.find((element) => element.id === collectionItem.id);
    });
  }
}

module.exports = GithubPullRequestReporter;

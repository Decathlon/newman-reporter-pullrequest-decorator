/* eslint-disable no-console */

const GithubService = require('./github-service');
const utils = require('./utils');

const buildOptions = (reporterOptions, newmanOptions) => {
  console.log('[+] Reporter Options', reporterOptions);

  // Github parameters are only required in non export mode.
  if (!reporterOptions.export) {
    if (!reporterOptions.pullrequestDecoratorRepo) {
      throw new Error('[-] ERROR: Github PullRequest Repository name is missing ! Add --reporter-pullrequest-decorator-repo <repo>.');
    }

    if (!reporterOptions.pullrequestDecoratorRefcommit) {
      throw new Error('[-] ERROR: Github PullRequest Ref commit is missing ! Add --reporter-pullrequest-decorator-refcommit <refcommit>.');
    }

    if (!reporterOptions.pullrequestDecoratorToken) {
      throw new Error('[-] ERROR: Github PullRequest Token is missing ! Add --reporter-pullrequest-decorator-token <token>.');
    }
  }

  return {
    repo: reporterOptions.pullrequestDecoratorRepo,
    refCommit: reporterOptions.pullrequestDecoratorRefcommit,
    checkName: reporterOptions.pullrequestDecoratorCheckname,
    token: reporterOptions.pullrequestDecoratorToken,
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

const REGISTERED_NEWMAN_EVENTS = ['start', 'beforeItem', 'request', 'assertion', 'beforeDone', 'done'];

/**
 * Reporter responsible of generating a context containing postman collection results
 * to be sent to GithubService.
 */
class PullRequestDecoratorReporter {
  constructor(newmanEmitter, reporterOptions, newmanOptions) {
    this.newmanEmitter = newmanEmitter;
    this.options = buildOptions(reporterOptions, newmanOptions);
    this.context = buildEmptyContext();
    this.githubService = new GithubService(this.options);

    REGISTERED_NEWMAN_EVENTS.forEach((event) => {
      typeof this[event] === 'function' && newmanEmitter.on(event, (err, args) => this[event](err, args));
    });
  }

  start() {
    console.log(`[+] Starting collection: ${this.options.collectionName} with following context : ${JSON.stringify(this.options)} `);
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
    } else {
      throw new Error(`[-] ERROR: Result of the request named [${item.name}] cannot be identified neither as an error nor a success.`);
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
        this.context.currentItem.skipped.push(args.assertion);
        this.context.assertions.skipped_count += 1;
      } else {
        this.context.assertions.failed_count += 1;
      }
    }
  }

  beforeDone(error, args) {
    if (this.options.export) {
      this.newmanEmitter.exports.push({
        name: 'pullrequest-decorator-reporter',
        default: 'newman-run-report.md',
        path: this.options.export,
        content: utils.buildMarkdownText(this.buildItemsReport(args.summary.collection.items)),
      });
      console.log(`[+] Finished collection: ${this.options.collectionName}`);
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

module.exports = PullRequestDecoratorReporter;

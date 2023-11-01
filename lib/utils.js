const HEADER_STARTING_NUMBER = 2;
const WHITESPACE = ' ';
const HEADER_LINE = ['Request Name', 'Status', 'failed', 'API Method', 'API Response', 'API URL', ' API Status', 'API Code'];

const isParentLevel = (items) => items.every((item) => item.subItems);
const isLeafLevel = (items) => items.every((item) => !item.subItems);

const withParentNameHeaders = (position) => (buildParentMarkdownText) => {
  buildParentMarkdownText(position || HEADER_STARTING_NUMBER);
};

const buildParentMarkdown = (markdownText, item) => (position) => {
  markdownText.push(
    [
      ['#'.repeat(position), item.name].join(WHITESPACE),
      // eslint-disable-next-line no-use-before-define
      buildMarkdownText(item.subItems, position + 1),
    ].join('\n\n'),
  );
};

const buildTableHeader = () => {
  const dashedLine = HEADER_LINE.map(() => '-'.repeat(10));
  return [HEADER_LINE.join(' | '), dashedLine.join(' | ')].join('\n');
};

const toEmoji = (status) => {
  if (status === 'PASS') {
    return `${status} :white_check_mark:`;
  }
  return `${status} :x:`;
};

const buildTableContent = (items) => items.map((item) => `| ${[
  item.request_name,
  toEmoji(item.test_status),
  item.failed.join(WHITESPACE).replace(/\||\n/g, ' '),
  item.method,
  item.failed.length > 0 ? item.body : '',
  item.url,
  item.status,
  item.code]
  .join(' | ')} |`).join('\n');

/**
 * Generate markdown text from prebuilt item list.
 * @param {List} items List containing items corresponding
 * to each postman request (or folder) and their results.
 * @param {number} position Default to 0. Used to build markdown heading level.
 * @returns markdown will collection results.
 */
const buildMarkdownText = (items, position) => {
  const markdownText = [];
  if (isParentLevel(items)) {
    items.forEach((item) => {
      withParentNameHeaders(position)(buildParentMarkdown(markdownText, item));
    });
  } else if (isLeafLevel(items)) {
    markdownText.push([buildTableHeader(), buildTableContent(items)].join('\n'));
  } else {
    throw new Error('Collection should contain at any level either only folders or requests.');
  }
  return markdownText.join('\n\n');
};

const buildCheckPageUrl = (options, issueNumber, checkRunId) => {
  const owner = options.repo.split('/')[0];
  const repo = options.repo.split('/')[1];
  const url = `https://github.com/${owner}/${repo}/pull/${issueNumber}/checks?check_run_id=${checkRunId}`;
  return url;
};

const buildFailureComment = (commentParam, report) => {
  let comment = commentParam;
  report.items
    .filter((item) => item.test_status === 'FAIL')
    .forEach((item, index) => {
      if (index === 0) {
        comment += ' \n **The following tests are failing:** \n';
      }
      comment += (`\n [+] ${item.request_name}\n`);
      item.failed.forEach((test) => {
        comment += `  -  ${test} \n`;
      });
    });
  return comment;
};

const buildPullRequestComment = (report, options, issueNumber, checkRunId) => {
  const { items } = report;
  const requestsFailedCount = report.items.filter((item) => item.test_status === 'FAIL').length;
  const requestsSkippedCount = report.items.filter((item) => item.test_status === 'SKIP').length;

  const comment = `Please find the complete report [here](${buildCheckPageUrl(options, issueNumber, checkRunId)})  
  ✅ ${items.length - (requestsFailedCount) - requestsSkippedCount} / ${items.length} **Requests Passed** 
  ❌ ${requestsFailedCount} / ${items.length} **Requests Failed**
  ⏩ ${(requestsSkippedCount)} / ${items.length} **Requests Skipped**`;

  return requestsFailedCount > 0
    ? (`You have some failing tests \n ${buildFailureComment(comment, report)}`)
    : (`Congratulations, All Tests have Passed! \n${comment}`);
};

module.exports = {
  buildMarkdownText,
  buildPullRequestComment,
};

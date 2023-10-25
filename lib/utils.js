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

const buildPullRequestComment = (report, linkToChecks) => {
  const { assertions, items } = report;
  let variableMessagePart = "Congratulations, All Tests have Passed! \n";

  if (report.items.filter((item) => item.test_status === 'FAIL').length > 0 ||
      report.items.filter((item) => item.test_status === 'SKIP').length > 0) {
    variableMessagePart = "Here is a summary of your collection:"
  }

  let comment = `${variableMessagePart}
  Please find the complete report here: ${linkToChecks} 
  ✅ ${items.length - (report.items.filter((item) => item.test_status === 'FAIL').length) - (report.items.filter((item) => item.test_status === 'SKIP').length)} / ${items.length} **Requests Passed** 
  ❌ ${report.items.filter((item) => item.test_status === 'FAIL').length} / ${items.length} **Requests Failed**
  ⏩ ${(report.items.filter((item) => item.test_status === 'SKIP').length)} / ${items.length} **Requests Skipped**`; 


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

const buildCheckPageUrl = (options, issueNumber) => {
  const owner = options.repo.split("/")[0];
  const repo = options.repo.split("/")[1];
  const url = `https://github.com/${owner}/${repo}/pull/${issueNumber}/checks`
  return url;
}

module.exports = {
  buildMarkdownText,
  buildPullRequestComment,
  buildCheckPageUrl,
};

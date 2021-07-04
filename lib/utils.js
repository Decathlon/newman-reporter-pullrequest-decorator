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

module.exports = {
  buildMarkdownText,
};

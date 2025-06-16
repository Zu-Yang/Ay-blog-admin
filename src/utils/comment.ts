/** 
 * 将 Unicode 转义序列还原为Emoji。
 * 
 * @param {string} content - 将 Unicode 转义序列还原为Emoji。
 * @returns {string} 处理后的内容。
*/
export const useDecodeEmoji = (content: string): string => {
  // 将 Unicode 转义序列还原为Emoji
  const decodeEmoji = content.replace(/\\u([\dA-Fa-f]{4,5})/g, (match, p1) => String.fromCodePoint(parseInt(p1, 16)))

  return decodeEmoji;
};

/** 
 * 将 Unicode 转义序列还原为Emoji->内容过多截断->匹配内容链接转a标签；注：转换顺序不能变。
 * 
 * @param {string} content - 要处理的内容。
 * @param {number} limit - 限制字符数。
 * @param {boolean} isExpanded - 是否展开内容。
 * @returns {string} 处理后的内容。
*/
export const contentHandler = (content: string, isExpanded: boolean = false, limit: number = 200): string => {
  // 将 Unicode 转义序列还原为Emoji
  const str = useDecodeEmoji(content);

  // 内容过多截断
  let processedContent = str;
  if (!isExpanded && str.length > limit) {
    processedContent = str.slice(0, limit) + "...";
  }

  // 匹配内容链接转a标签
  const withLinks = processedContent.replace(
    /(?:https?:\/\/)?((?:www\.|[\da-z-]+\.)+[\da-z-]{2,}(?:\.\w{2,})?|(?:\d{1,3}\.){3}\d{1,3}|localhost)(?::\d+)?(\/[^\s<>{}|\\^~[\]`!?:;'"`]*[^\s\/<>{}|\\^~[\]`!?:;'"`])?\/?/gi,
    (match) => {
      let fullUrl = match;
      // 自动补全协议
      if (!/^https?:\/\//i.test(match)) {
        fullUrl = match.startsWith('www.')
          ? `https://${match}`
          : `https://${match}`;
      }
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`
    });

  return withLinks;
};

/** 
 * 将字符串中的 Emoji 转换为 Unicode 转义序列。
 * @param {string} content - 要处理的内容。
*/
export const useEncodeEmoji = (content: string): string => {
  return content.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{200D}\u{FE0F}]/gu,
    (match: string) => {
      return `\\u${match.codePointAt(0)?.toString(16).padStart(4, "0")}`;
    }
  );
};
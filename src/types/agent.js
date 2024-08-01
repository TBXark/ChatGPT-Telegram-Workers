/**
 * @typedef {object} LlmRequestParams
 * @property {?string} [message] - 输入文本
 * @property {string[]} [images] - 图片
 */

/**
 * @typedef {LlmRequestParams} LlmParams
 * @property {?string} [prompt] - 提示
 * @property {HistoryItem[]} [history] - 历史记录
 */

/**
 *
 * @typedef {function} ChatAgentRequest
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {function} onStream
 * @return {Promise<string>}
 *
 */

/**
 * @typedef {object} ChatAgent
 * @property {string} name
 * @property {function} enable
 * @property {ChatAgentRequest} request
 */

/**
 * @typedef {object} HistoryItem
 * @property {string} role
 * @property {string} content
 * @property {string[]} [images] - 图片
 */

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
 * @callback IsAgentEnable
 * @param {ContextType} context
 * @returns {boolean}
 */

/**
 * @callback AgentTextHandler
 * @param {string} text
 * @returns {Promise<any>}
 */

/**
 * @callback ChatAgentRequest
 * @param {LlmParams} params
 * @param {ContextType} context
 * @param {AgentTextHandler} onStream
 * @returns {Promise<string>}
 */

/**
 * @typedef {object} ChatAgent
 * @property {string} name
 * @property {IsAgentEnable} enable
 * @property {ChatAgentRequest} request
 */

/**
 * @callback ImageAgentRequest
 * @param {string} prompt
 * @param {ContextType} context
 * @returns {Promise<string|Blob>}
 */

/**
 * @typedef {object} ImageAgent
 * @property {string} name
 * @property {IsAgentEnable} enable
 * @property {ImageAgentRequest} request
 */

/**
 * @typedef {object} HistoryItem
 * @property {string} role
 * @property {string} content
 * @property {string[]} [images] - 图片
 */

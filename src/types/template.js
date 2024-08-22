export const TemplateInputTypeJson = 'json';
export const TemplateInputTypeSpaceSeparated = 'space-separated';
export const TemplateInputTypeCommaSeparated = 'comma-separated';

export const TemplateBodyTypeJson = 'json';
export const TemplateBodyTypeForm = 'form';
export const TemplateBodyTypeText = 'text';

export const TemplateResponseTypeJson = 'json';
export const TemplateResponseTypeText = 'text';

export const TemplateOutputTypeText = 'text';
export const TemplateOutputTypeImage = 'image';
export const TemplateOutputTypeHTML = 'html';
export const TemplateOutputTypeMarkdown = 'markdown';

/**
 * @typedef {object} RequestTemplate
 * @property {string} url
 * @property {string} method
 * @property {{[key: string]: string}} headers
 * @property {object} input
 * @property {string} input.type
 * @property {{[key: string]: string}} query
 * @property {object} body
 * @property {string} body.type
 * @property {{[key: string]: string} | string} body.content
 * @property {object} response
 * @property {object} response.content
 * @property {string} response.content.input_type
 * @property {string} response.content.output_type
 * @property {string} response.content.output
 * @property {object} response.error
 * @property {string} response.error.input_type
 * @property {string} response.error.output_type
 * @property {string} response.error.output
 */

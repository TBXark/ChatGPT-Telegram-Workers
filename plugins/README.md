# Plugin System

> The plugin system is still under development, and the functions may change, but the documentation will be updated as much as possible.


# What is a plugin system?

A plugin system is a system that allows users to customize functions. Users can add new functions through the plugin system. The definition of a plugin is a JSON file, and users can call the plugin by binding the corresponding command.


## Plugin structure

```typescript


/**
 * TemplateInputType: The type of input data, converting the data input from Telegram into the corresponding data type
 * json: JSON format
 * space-separated: Space-separated string
 * comma-separated: Comma-separated string
 * text: Text, not split (default value)
 */
export type TemplateInputType = 'json' | 'space-separated' | 'comma-separated' | 'text';

/**
 * TemplateBodyType: The type of the request body
 * json: JSON format, at this time the value of the content field should be an object, where the key is a fixed value, and the value supports interpolation
 * form: Form format, at this time the value of the content field should be an object, where the key is a fixed value, and the value supports interpolation
 * text: Text format, at this time the value of the content field should be a string, supporting interpolation
 */
export type TemplateBodyType = 'json' | 'form' | 'text';

/**
 * TemplateResponseType: The type of response body
 * json: JSON format, at this time the response body will be parsed into JSON format and passed to the next template for rendering
 * text: Text format, at this time the response body will be parsed into text format and passed to the next template for rendering
 */
export type TemplateResponseType = 'json' | 'text';

/**
 * TemplateOutputType: The type of output data
 * text: Text format, sends the rendering result as plain text to Telegram
 * image: Image format, sends the rendering result as an image URL to Telegram
 * html: HTML format, sends the rendering result in HTML format to Telegram
 * markdown: Markdown format, sends the rendering result in Markdown format to Telegram
 */
export type TemplateOutputType = 'text' | 'image' | 'html' | 'markdown';

export interface RequestTemplate {
    url: string; // Required, supports interpolation
    method: string; // Required, fixed value
    headers: { [key: string]: string }; // Optional, Key is a fixed value, Value supports interpolation.
    input: {
        type: TemplateInputType;
    };
    query: { [key: string]: string }; // Optional, Key is a fixed value, Value supports interpolation.
    body: {
        type: TemplateBodyType;
        content: { [key: string]: string } | string; // When content is an object, Key is a fixed value, and Value supports interpolation. When content is a string, it supports interpolation.
    };
    response: {
        content: { // Required, handling when the request is successful.
            input_type: TemplateResponseType;
            output_type: TemplateOutputType;
            output: string;
        };
        error: { // Required, handling when the request fails.
            input_type: TemplateResponseType;
            output_type: TemplateOutputType;
            output: string;
        };
    };
}
```


## Plugin Usage

For example, define the following variables in the environment variables:

```toml
PLUGIN_COMMAND_dns = "https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/dev/plugins/dns.json"
PLUGIN_DESCRIPTION_dns = "DNS query /dns <type> <domain>"
```

Then enter `/dns A www.baidu.com` in the command line to call the plugin.
Where `PLUGIN_COMMAND_dns` is the address of the plugin's json file, and `PLUGIN_DESCRIPTION_dns` is the description of the plugin.
`PLUGIN_COMMAND_dns` can be a complete json or a url of a json.

If you want to bind plugin commands to the menu of Telegram, you can add the following environment variable `PLUGIN_SCOPE_dns = "all_private_chats,all_group_chats,all_chat_administrators"`, so that the plugin will take effect in all private chats, group chats and groups.


## Interpolation Template

You can test the interpolation template in the [interpolation template test page](https://interpolate-test.pages.dev).

```html
  <b>{{title}}</b>
  <b>
  {{#each item in items}}
    {{#each:item i in item}}
      {{ i.value }}
      {{#if i.enable}}
        {{#if:sub i.subEnable}}
          sub enable
        {{#else:sub}}
          sub disable
        {{/if:sub}}
      {{#else}}
        disable
      {{/if}}
    {{/each:item}}
  {{/each}}
  </b>
```

1. `{{title}}` represents the variable of interpolation template, supporting key path and array subscript.
2. `{{#each item in items}}` represents traversing the array items, item is each element of the array, and must include the ending `{{/each}}`.
3. `{{#each:item i in item}}` Nested traversal operations need to add aliases to the traversal, and the ending also needs to correspond to the alias `{{/each:item}}`.
4. `{{#if i.enable}}` represents conditional judgment. The judgment condition does not support expressions and can only judge non-empty and non-zero. It must include the ending `{{/if}}`.
5. `{{#else}}` represents the negative branch of conditional judgment.
6. `{{#if:sub i.subEnable}}` Nested conditional judgment needs to add aliases to the condition, and the ending also needs to correspond to the alias `{{/if:sub}}`.
7. There should be no spaces in the interpolation or expression in `{{}}`, otherwise it will be parsed as a string. For example, this is an incorrect interpolation `{{ title }}`.
8. `{{.}}` represents the current data, which can be used in `#each` or globally.


## Interpolation Variables

The default data structure passed into interpolation is as follows:

```json
{
  "DATA": [],
  "ENV": {}
}
```

1. Among them, `DATA` is the data input by the user, and the data structure of DATA varies according to different `TemplateInputType`.
2. `ENV` is an environment variable that users can use to pass in data. The plugin's environment variables are isolated from the global environment variables and require different syntax to pass in.


## Plugin Environment Variables

You can save the token required for the request in the plugin environment variables. The plugin environment variables must start with `PLUGIN_ENV_`, for example:
```toml
PLUGIN_ENV_access_token = "xxxx"
```

It will be parsed as.

```json
{
    "DATA": [],
    "ENV": {
      "access_token": "xxxx"
    }
}
```


## Plugin Examples

1. [DNS Query Plugin Example](dns.json)
2. [Dictionary Query Plugin Example](dicten.json)

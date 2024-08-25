# Plugin System

> The plugin system is still under development, and the functions may change, but the documentation will be updated as much as possible.


# What is a plugin system?

A plugin system is a system that allows users to customize functions. Users can add new functions through the plugin system. The definition of a plugin is a JSON file, and users can call the plugin by binding the corresponding command.


## Plugin structure

```typescript

// TemplateInputType represents the parsing method of user input
// 1. json represents that the input is a JSON object
// 2. space-separated represents that the input is a string separated by spaces
// 3. comma-separated represents that the input is a string separated by commas
// 4. text represents that the input is a string (default value)
export type TemplateInputType = 'json' | 'space-separated' | 'comma-separated' | 'text';

// TemplateBodyType represents the parsing method of the request body.
// 1. json represents that the request body is a JSON object. In this case, the corresponding body.content is a JSON object, and all JSON values can be injected with data through interpolation templates.
// 2. form represents that the request body is a form. In this case, the corresponding body.content is a JSON object, and all JSON values can be injected with data through interpolation templates.
// 3. text represents that the request body is a string. In this case, the corresponding body.content is a string (default value), and body.content can be injected with data through interpolation templates.
export type TemplateBodyType = 'json' | 'form' | 'text';

// TemplateResponseType represents the parsing method of the response body.
// 1. json represents that the response body is a JSON object (default value). At this time, the response body will be parsed into a JSON object and then passed as input to the response template data.
// 2. text represents that the response body is a string, and the response body string is directly passed as data to the response template.
export type TemplateResponseType = 'json' | 'text';

// TemplateOutputType represents the type of data sent to the user
// 1. text represents that the data sent to the user is a string (default value)
// 2. image represents that the data sent to the user is an image
// 3. html represents that the data sent to the user is an html
// 4. markdown represents that the data sent to the user is a markdown
export type TemplateOutputType = 'text' | 'image' | 'html' | 'markdown';

export interface RequestTemplate {
  url: string; // Support interpolation, inserted values will be automatically encoded.
  method: string;
  headers: {[key: string]: string}; // Value supports interpolation.
  input: {
    type: TemplateInputType;
  };
  query: {[key: string]: string}; // Value supports interpolation, and inserted values will be automatically encoded.
  body: {
    type: TemplateBodyType;
    content: {[key: string]: string} | string; // When the content is an object, the value supports interpolation. When the content is a string, it supports interpolation.
  };
  response: {
    content: {
      input_type: TemplateResponseType;
      output_type: TemplateOutputType;
      output: string; // Support interpolation, insert the data of the response body as the inserted value, and the inserted value will be automatically encoded according to the input_type.
    };
    error: { //Use the error template when response.ok is false.
      input_type: TemplateResponseType;
      output_type: TemplateOutputType;
      output: string; // Support interpolation, insert the data of the response body as the inserted value, and the inserted value will be automatically encoded according to the input_type.
    };
  };
}
```


## Plugin Usage

For example, define the following variables in the environment variables:

```toml
PLUGIN_COMMAND_dns = "https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/dev/plugins/dns.json"
PLUGIN_COMMAND_DESCRIPTION_dns = "DNS query /dns <type> <domain>"
```

Then enter `/dns A www.baidu.com` in the command line to call the plugin.
Where `PLUGIN_COMMAND_dns` is the address of the plugin's json file, and `PLUGIN_DESCRIPTION_dns` is the description of the plugin.
`PLUGIN_COMMAND_dns` can be a complete json or a url of a json.


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
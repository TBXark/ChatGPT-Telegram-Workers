# 插件系统

> 插件系统还在开发中，功能可能会有变动但是文档会尽量保持更新


## 插件系统是什么？

插件系统是一种允许用户自定义功能的系统。用户可以通过插件系统添加新的功能，插件的定义是一个json文件，用户通过绑定对应的命令来调用插件。


## 插件的结构

```typescript

/**
 * TemplateInputType: 输入数据的类型,将Telegram输入的数据转换为对应的数据类型
 * json: JSON格式
 * space-separated: 以空格分隔的字符串
 * comma-separated: 以逗号分隔的字符串
 * text: 文本,不分割(默认值)
 */
export type TemplateInputType = 'json' | 'space-separated' | 'comma-separated' | 'text';

/**
 * TemplateBodyType: 请求体的类型
 * json: JSON格式, 此时对于content字段的值应该为一个对象,其中的key为固定值,Value支持插值
 * form: 表单格式, 此时对于content字段的值应该为一个对象,其中的key为固定值,Value支持插值
 * text: 文本格式, 此时对于content字段的值应该为一个字符串,支持插值
 */
export type TemplateBodyType = 'json' | 'form' | 'text';

/**
 * TemplateResponseType: 响应体的类型
 * json: JSON格式, 此时会将响应体解析为JSON格式交给下一个模板渲染
 * text: 文本格式, 此时会将响应体解析为文本格式交给下一个模板渲染
 */
export type TemplateResponseType = 'json' | 'text';

/**
 * TemplateOutputType: 输出数据的类型
 * text: 文本格式, 将渲染结果作为纯文本发送到telegram
 * image: 图片格式, 将渲染结果作为图片url发送到telegram
 * html: HTML格式, 将渲染结果作为HTML格式发送到telegram
 * markdown: Markdown格式, 将渲染结果作为Markdown格式发送到telegram
 */
export type TemplateOutputType = 'text' | 'image' | 'html' | 'markdown';

export interface RequestTemplate {
    url: string; // 必选, 支持插值
    method: string; // 必选, 固定值
    headers: { [key: string]: string }; // 可选, Key为固定值，Value支持插值
    input: {
        type: TemplateInputType;
    };
    query: { [key: string]: string }; // 可选, Key为固定值，Value支持插值
    body: {
        type: TemplateBodyType;
        content: { [key: string]: string } | string; // content为对象时Key为固定值，Value支持插值。content为字符串时支持插值
    };
    response: {
        content: { // 必选, 当请求成功时的处理
            input_type: TemplateResponseType;
            output_type: TemplateOutputType;
            output: string;
        };
        error: { // 必选, 当请求失败时的处理
            input_type: TemplateResponseType;
            output_type: TemplateOutputType;
            output: string;
        };
    };
}
```

## 插件的使用

例如在环境变量中定义如下变量

```toml
PLUGIN_COMMAND_dns = "https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/dev/plugins/dns.json"
PLUGIN_DESCRIPTION_dns = "DNS查询 /dns <类型> <域名>"
```

然后在命令行中输入`/dns A www.baidu.com`即可调用插件

其中`PLUGIN_COMMAND_dns`是插件的json文件地址，`PLUGIN_DESCRIPTION_dns`是插件的描述。
`PLUGIN_COMMAND_dns`可以是完整的json也可以是一个json的url。

如果你想将插件命令绑定到telegram的菜单中，你可以添加如下环境变量`PLUGIN_SCOPE_dns = "all_private_chats,all_group_chats,all_chat_administrators"`，这样插件就会在所有的私聊，群聊和群组中生效。


## 插值模板

您可以在[插值模板测试页面](https://interpolate-test.pages.dev)中测试插值模板。

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

1. `{{title}}` 代表插值模板的变量,支持键路径和数组下标
2. `{{#each item in items}}` 代表遍历数组items, item是数组的每一个元素，必须包含结尾 `{{/each}}`
3. `{{#each:item i in item}}` 嵌套遍历操作需要给遍历添加别名，结尾也需要对应的别名 `{{/each:item}}`
4. `{{#if i.enable}}` 代表条件判断，判断条件不支持表达式，只能判断非，非空，非0，必须包含结尾 `{{/if}}`
5. `{{#else}}` 代表条件判断的否定分支
6. `{{#if:sub i.subEnable}}` 嵌套代表条件判断需要给条件添加别名，结尾也需要对应的别名 `{{/if:sub}}`
7. 所有`{{}}`中的插值或者表达式不能有空格，否则会被解析为字符串，比如这个就是一个错误的插值 `{{ title }}`
8. `{{.}}` 代表当前的数据, 可以在`#each`中使用或者全局使用


## 插值的变量

默认传入插值的数据结构如下

```json
{
  "DATA": [],
  "ENV": {}
}
```

1. 其中`DATA`为用户输入的数据，根据`TemplateInputType`的不同，DATA的数据结构也不同
2. `ENV`为环境变量，用户可以通过环境变量传入数据,插件的环境变量与全局的环境变量隔离，需要不同的语法传入


## 插件环境变量

你可以在插件环境变量中保存请求所需的token，插件环境变量必须以`PLUGIN_ENV_`开头，例如

```toml
PLUGIN_ENV_access_token = "xxxx"
```

就会被解析成

```json
{
    "DATA": [],
    "ENV": {
      "access_token": "xxxx"
    }
}
```

## 插件示例

1. [DNS查询插件示例](dns.json)
2. [字典查询插件示例](dicten.json)

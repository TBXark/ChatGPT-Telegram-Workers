# 插件系统
> 插件系统还在开发中，功能可能会有变动但是文档会尽量保持更新

## 插件系统是什么？
插件系统是一种允许用户自定义功能的系统。用户可以通过插件系统添加新的功能，插件的定义是一个json文件，用户通过绑定对应的命令来调用插件。

## 插件的结构
```typescript

export type TemplateInputType = 'json' | 'space-separated' | 'comma-separated' | 'text';
// TemplateInputType 代表用户输入的解析方式
// 1. json代表输入是一个json对象
// 2. space-separated代表输入是以空格分隔的字符串
// 3. comma-separated代表输入是以逗号分隔的字符串
// 4. text代表输入是一个字符串(默认值)

export type TemplateBodyType = 'json' | 'form' | 'text';
// TemplateBodyType 代表请求体的解析方式
// 1. json代表请求体是一个json对象, 这时对应的body.content是一个json对象,所有的json的value都可以通过插值模板注入数据
// 2. form代表请求体是一个表单, 这时对应的body.content是一个json对象,所有的json的value都可以通过插值模板注入数据
// 3. text代表请求体是一个字符串, 这时对应的body.content是一个字符串(默认值),body.content可以通过插值模板注入数据

export type TemplateResponseType = 'json' | 'text';
// TemplateResponseType 代表响应体的解析方式
// 1. json代表响应体是一个json对象,这时会将响应体解析为json对象然后在作为输入传给响应模板的数据
// 2. text代表响应体是一个字符串(默认值),响应体的字符串直接作为数据传给响应模板的数据

export type TemplateOutputType = 'text' | 'image' | 'html' | 'markdown';
// TemplateOutputType 代表发送给用户的数据的类型
// 1. text代表发送给用户的数据是一个字符串
// 2. image代表发送给用户的数据是一个图片
// 3. html代表发送给用户的数据是一个html
// 4. markdown代表发送给用户的数据是一个markdown

// 定义接口
export interface RequestTemplate {
  url: string;
  method: string;
  headers: {[key: string]: string};
  input: {
    type: TemplateInputType;
  };
  query: {[key: string]: string};
  body: {
    type: TemplateBodyType;
    content: {[key: string]: string} | string;
  };
  response: {
    content: {
      input_type: TemplateResponseType;
      output_type: TemplateOutputType;
      output: string;
    };
    error: {
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
PLUGIN_COMMAND_DESCRIPTION_dns = "DNS查询 /dns <类型> <域名>"
```
然后在命令行中输入`/dns A www.baidu.com`即可调用插件

其中`PLUGIN_COMMAND_dns`是插件的json文件地址，`PLUGIN_COMMAND_DESCRIPTION_dns`是插件的描述。
`PLUGIN_COMMAND_dns`可以是完整的json也可以是一个json的url


## 插值模板
示例
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


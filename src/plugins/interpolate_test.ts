import { interpolate } from './interpolate';

{
    const template = 'Hello, {{name}}!';
    const data = { name: 'Alice' };
    console.assert(interpolate(template, data) === 'Hello, Alice!', '基本变量插值失败');
}
{
    const template = '{{user.name}} is {{user.age}} years old.';
    const data = { user: { name: 'Bob', age: 30 } };
    console.assert(interpolate(template, data) === 'Bob is 30 years old.', '嵌套对象属性插值失败');
}
{
    const template = 'The first item is {{items[0]}}.';
    const data = { items: ['apple', 'banana', 'cherry'] };
    console.assert(interpolate(template, data) === 'The first item is apple.', '数组索引插值失败');
}
{
    const template = '{{#if isAdmin}}Admin{{#else}}User{{/if}}';
    const data1 = { isAdmin: true };
    const data2 = { isAdmin: false };
    console.assert(interpolate(template, data1) === 'Admin', '条件语句真值测试失败');
    console.assert(interpolate(template, data2) === 'User', '条件语句假值测试失败');
}
{
    const template = '<ul>{{#each item in items}}<li>{{item}}</li>{{/each}}</ul>';
    const data = { items: ['a', 'b', 'c'] };
    console.assert(interpolate(template, data) === '<ul><li>a</li><li>b</li><li>c</li></ul>', '循环语句测试失败');
}
{
    const template = '{{#each item in items}}{{.}},{{/each}}';
    const data = { items: [1, 2, 3] };
    console.assert(interpolate(template, data) === '1,2,3,', '当前上下文插值测试失败');
}
{
    const template = 'Hello, {{name}}!';
    const data = {};
    console.assert(interpolate(template, data) === 'Hello, {{name}}!', '不存在的变量处理失败');
}

{
    const template = `
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
`;

    const data = {
        title: 'hello',
        items: [
            [
                { value: 'a', enable: true, sub: { subEnable: true } },
                { value: 'b', enable: false, sub: { subEnable: false } },
            ],
            [
                { value: 'c', enable: true, sub: { subEnable: false } },
                { value: 'd', enable: false, sub: { subEnable: true } },
            ],
        ],
    };

    console.log(interpolate(template, data));
}

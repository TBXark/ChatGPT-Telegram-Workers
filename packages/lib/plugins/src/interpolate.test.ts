import { interpolate } from './interpolate';

describe('interpolate', () => {
    it('基本变量插值', () => {
        const template = 'Hello, {{name}}!';
        const data = { name: 'Alice' };
        expect(interpolate(template, data)).toBe('Hello, Alice!');
    });

    it('嵌套对象属性插值', () => {
        const template = '{{user.name}} is {{user.age}} years old.';
        const data = { user: { name: 'Bob', age: 30 } };
        expect(interpolate(template, data)).toBe('Bob is 30 years old.');
    });

    it('数组索引插值', () => {
        const template = 'The first item is {{items[0]}}.';
        const data = { items: ['apple', 'banana', 'cherry'] };
        expect(interpolate(template, data)).toBe('The first item is apple.');
    });

    it('条件语句', () => {
        const template = '{{#if isAdmin}}Admin{{#else}}User{{/if}}';
        const data1 = { isAdmin: true };
        const data2 = { isAdmin: false };
        expect(interpolate(template, data1)).toBe('Admin');
        expect(interpolate(template, data2)).toBe('User');
    });

    it('循环语句', () => {
        const template = '<ul>{{#each item in items}}<li>{{item}}</li>{{/each}}</ul>';
        const data = { items: ['a', 'b', 'c'] };
        expect(interpolate(template, data)).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
    });
    it('当前上下文插值', () => {
        const template = '{{#each item in items}}{{.}},{{/each}}';
        const data = { items: [1, 2, 3] };
        expect(interpolate(template, data)).toBe('1,2,3,');
    });
    it('不存在的变量处理', () => {
        const template = 'Hello, {{name}}!';
        const data = {};
        expect(interpolate(template, data)).toBe('Hello, {{name}}!');
    });
    it('复杂模板', () => {
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
    });
});

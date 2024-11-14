import { interpolate } from '@chatgpt-telegram-workers/plugins';

const templateEle = document.getElementById('template') as HTMLInputElement;
const dataEle = document.getElementById('data') as HTMLInputElement;
const previewEle = document.getElementById('preview') as HTMLElement;

function updatePreview() {
    const template = templateEle.value;
    const data = dataEle.value;
    try {
        previewEle.innerHTML = interpolate(template, JSON.parse(data));
    } catch (e) {
        previewEle.innerHTML = `<span style="color: red;">${(e as Error).message}</span>`;
    }
}

templateEle.addEventListener('input', updatePreview);
dataEle.addEventListener('input', updatePreview);

templateEle.value = `
<b>DNS query: {{Question[0].name}}</b>
<code>Status: {{#if TC}}TC,{{/if}}{{#if RD}}RD,{{/if}}{{#if RA}}RA,{{/if}}{{#if AD}}AD,{{/if}}{{#if CD}}CD,{{/if}}{{Status}}</code>

<b>Answer</b>{{#each answer in Answer}}
<code>{{answer.name}}, {{answer.type}}, (TTL: {{answer.TTL}}),{{answer.data}}</code>{{/each}}
`;

dataEle.value = JSON.stringify({
    Status: 0,
    TC: false,
    RD: true,
    RA: true,
    AD: false,
    CD: false,
    Question: [
        {
            name: 'google.com',
            type: 1,
        },
    ],
    Answer: [
        {
            name: 'google.com',
            type: 1,
            TTL: 300,
            data: '172.217.24.110',
        },
    ],
}, null, 2);
updatePreview();

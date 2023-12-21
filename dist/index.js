function yt(){let e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0"),o=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0"),h=String(e.getSeconds()).padStart(2,"0"),l=String(e.getMilliseconds()).padStart(3,"0");return`${t}-${n}-${r} ${o}:${i}:${h}.${l}`}function d(e,t){let n=t;t instanceof Error?n={message:t.message,stack:t.stack}:typeof t=="function"&&(n=t.toString());let r=`(${yt()}) [${e}] ${typeof n=="object"?JSON.stringify(n,null,2):n}`;e==="error"?console.error(r):console.log(r)}var Ot={API_KEY:"string",AMOUNT_OF_FREE_MESSAGES:"number",ACTIVATION_CODE:"string",LINK_TO_PAY_FOR_CODE:"string"},St={gpt3Turbo:"gpt-3.5-turbo",gpt4:"gpt-4",gpt4Turbo:"gpt-4-1106-preview"},s={API_KEY:null,CHAT_MODEL:St.gpt3Turbo,TELEGRAM_AVAILABLE_TOKENS:[],TELEGRAM_BOT_NAME:[],I_AM_A_GENEROUS_PERSON:!1,CHAT_WHITE_LIST:[],CHAT_GROUP_WHITE_LIST:[],GROUP_CHAT_BOT_ENABLE:!0,GROUP_CHAT_BOT_SHARE_MODE:!1,AUTO_TRIM_HISTORY:!0,MAX_HISTORY_LENGTH:20,MAX_TOKEN_LENGTH:2048,GPT3_TOKENS_COUNT:!0,SYSTEM_INIT_MESSAGE:`
You are a Socratic tutor. Use the following principles in responding to students:
    
    - Ask thought-provoking, open-ended questions that challenge students&#39; preconceptions and encourage them to engage in deeper reflection and critical thinking.
    - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
    - Actively listen to students&#39; responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
    - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
    - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
    - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`,SYSTEM_INIT_MESSAGE_ROLE:"system",ENABLE_USAGE_STATISTICS:!1,HIDE_COMMAND_BUTTONS:[],UPDATE_BRANCH:"master",BUILD_TIMESTAMP:1703152755,BUILD_VERSION:"f566897",AMOUNT_OF_FREE_MESSAGES:1/0,ACTIVATION_CODE:null,LINK_TO_PAY_FOR_CODE:null,DEBUG_MODE:!1,DEV_MODE:!1,TELEGRAM_API_DOMAIN:"https://api.telegram.org",OPENAI_API_DOMAIN:"https://api.openai.com"},A={PASSWORD_KEY:"chat_history_password",GROUP_TYPES:["group","supergroup"],USER_AGENT:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15"},p=null;function q(e){p=e.DATABASE;for(let t in s)if(e[t])switch(Ot[t]||typeof s[t]){case"number":s[t]=parseInt(e[t])||s[t];break;case"boolean":s[t]=(e[t]||"false")==="true";break;case"string":s[t]=e[t];break;case"object":if(Array.isArray(s[t]))s[t]=e[t].split(",");else try{s[t]=JSON.parse(e[t])}catch(n){d("error",n)}break;default:s[t]=e[t];break}e.TELEGRAM_TOKEN&&!s.TELEGRAM_AVAILABLE_TOKENS.includes(e.TELEGRAM_TOKEN)&&(e.BOT_NAME&&s.TELEGRAM_AVAILABLE_TOKENS.length===s.TELEGRAM_BOT_NAME.length&&s.TELEGRAM_BOT_NAME.push(e.BOT_NAME),s.TELEGRAM_AVAILABLE_TOKENS.push(e.TELEGRAM_TOKEN))}var v="support@onout.org",Z="https://t.me/onoutsupportbot",j="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";var S={SYSTEM_INIT_MESSAGE:s.SYSTEM_INIT_MESSAGE,OPENAI_API_EXTRA_PARAMS:{}},I={ROLE:{}},_={chat_id:null,reply_to_message_id:null,parse_mode:"Markdown"},a={currentBotId:null,currentBotToken:null,currentBotName:null,chatHistoryKey:null,configStoreKey:null,userStoreKey:null,groupAdminKey:null,usageKey:null,chatType:null,chatId:null,speakerId:null};function wt(e,t){_.chat_id=e,_.reply_to_message_id=t,t&&(_.allow_sending_without_reply=!0)}async function Nt(e){try{let t=JSON.parse(await p.get(e));for(let n in t)n==="USER_DEFINE"&&typeof I==typeof t[n]?bt(t[n]):Object.hasOwn(S,n)&&typeof S[n]==typeof t[n]&&(S[n]=t[n])}catch(t){d("error",t)}}function bt(e){for(let t in e)Object.hasOwn(I,t)&&typeof I[t]==typeof e[t]&&(I[t]=e[t])}var It=/^\/telegram\/(bot)?(\d+:[A-Za-z0-9_-]+)\/webhook/;function Q(e){let{pathname:t}=new URL(e.url),n=t.match(It);if(!n)throw new Error("Token not found in the request path");let r=n[2],o=s.TELEGRAM_AVAILABLE_TOKENS.indexOf(r);if(o===-1)throw new Error("The bot token is not allowed");a.currentBotToken=r,a.currentBotId=r.split(":")[0],s.TELEGRAM_BOT_NAME.length>o&&(a.currentBotName=s.TELEGRAM_BOT_NAME[o])}async function Mt(e){a.usageKey=`usage:${a.currentBotId}`;let t=e?.chat?.id;if(!t)throw new Error("Chat ID not found");let n=e?.from?.id;if(!n)throw new Error("User ID not found");let r=a.currentBotId,o=`history:${t}`,i=`user_config:${t}`,h=`user:${n}`,l=null;r&&(o+=`:${r}`,i+=`:${r}`,h+=`:${r}`),A.GROUP_TYPES.includes(e.chat?.type)&&(!s.GROUP_CHAT_BOT_SHARE_MODE&&e.from.id&&(o+=`:${e.from.id}`,i+=`:${e.from.id}`),l=`group_admin:${t}`),a.chatHistoryKey=o,a.configStoreKey=i,a.userStoreKey=h,a.groupAdminKey=l,a.chatType=e.chat?.type,a.chatId=e.chat.id,a.speakerId=e.from.id||e.chat.id}async function tt(e){let t=e?.chat?.id,n=A.GROUP_TYPES.includes(e.chat?.type)?e.message_id:null;wt(t,n),await Mt(e),await Nt(a.configStoreKey)}async function et(e,t,n){if(!e)throw new Error("No Telegram message to send");if(!t)throw new Error("Missing Telegram bot token to send a message");if(!n?.chat_id)throw new Error("Missing Telegram chat ID to send a message");return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...n,text:e})})}async function f(e,t,n){let r=t||a.currentBotToken,o=n||_;if(e.length<=4096)return await et(e,r,o);let i=4e3;o.parse_mode="HTML";for(let h=0;h<e.length;h+=i){let l=e.slice(h,h+i);await et(`<pre>
${l}
</pre>`,r,o)}return new Response("MESSAGE BATCH SEND",{status:200})}async function nt(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/sendChatAction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:_.chat_id,action:e})}).then(n=>n.json())}async function rt(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t})}).then(n=>n.json())}async function ot(e){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/deleteWebhook`).then(t=>t.json())}async function st(e){let t;try{t=JSON.parse(await p.get(a.groupAdminKey))}catch(n){return d("error",n),n.message}if(!t||!Array.isArray(t)||t.length===0){let n=await Rt(_.chat_id);if(n==null)return null;t=n,await p.put(a.groupAdminKey,JSON.stringify(t),{expiration:parseInt(Date.now()/1e3)+120})}for(let n=0;n<t.length;n++){let r=t[n];if(r.user.id===e)return r.status}return"member"}async function Rt(e,t){try{let n=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/getChatAdministrators`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:e})}).then(r=>r.json());if(n.ok)return n.result}catch(n){return d("error",n),null}}async function at(e){let t=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/getMe`,{method:"POST",headers:{"Content-Type":"application/json"}}).then(n=>n.json());return t.ok?{ok:!0,info:{name:t.result.first_name,bot_name:t.result.username,can_join_groups:t.result.can_join_groups,can_read_all_group_messages:t.result.can_read_all_group_messages}}:t}function it(e){return e?.isActivated?!1:!!(typeof s.AMOUNT_OF_FREE_MESSAGES=="number"&&s.AMOUNT_OF_FREE_MESSAGES<1/0&&s.ACTIVATION_CODE&&typeof e.msgCounter=="number"&&e.msgCounter>=s.AMOUNT_OF_FREE_MESSAGES)}var Ct=e=>{if(typeof e!="string")return null;let t=e.trim().match(/Activation code:\s*([a-zA-Z0-9 ]{4,128})/);return t?t[1]:null};async function ct(e){let t=Ct(e.text);if(t){if(String(t)!==String(s.ACTIVATION_CODE))return f("Your code is wrong");let n=JSON.parse(await p.get(a.userStoreKey));return await p.put(a.userStoreKey,JSON.stringify({...n,isActivated:!0})),f("Successfully activated")}return null}async function D(e,t){let n={model:s.CHAT_MODEL,...S.OPENAI_API_EXTRA_PARAMS,messages:[...t||[],{role:"user",content:e}]},r=await fetch(`${s.OPENAI_API_DOMAIN}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.API_KEY}`},body:JSON.stringify(n)}).then(o=>o.json());if(r.error?.message)throw new Error(`OpenAI API error
> ${r.error.message}
current parameters: ${JSON.stringify(n)}`);return setTimeout(()=>Lt(r.usage).catch(console.error),0),r.choices[0].message.content}async function Lt(e){if(!s.ENABLE_USAGE_STATISTICS)return;let t=JSON.parse(await p.get(a.usageKey));t||(t={tokens:{total:0,chats:{}}}),t.tokens.total+=e.total_tokens,t.tokens.chats[a.chatId]?t.tokens.chats[a.chatId]+=e.total_tokens:t.tokens.chats[a.chatId]=e.total_tokens,await p.put(a.usageKey,JSON.stringify(t))}var Y={default:function(){return A.GROUP_TYPES.includes(a.chatType)?["administrator","creator"]:!1},shareModeGroup:function(){return A.GROUP_TYPES.includes(a.chatType)&&s.GROUP_CHAT_BOT_SHARE_MODE?["administrator","creator"]:!1}},y={"/help":{help:"Get command help",scopes:["all_private_chats","all_chat_administrators"],fn:kt},"/new":{help:"Initiate a new conversation",scopes:["all_private_chats","all_group_chats","all_chat_administrators"],fn:lt,needAuth:Y.shareModeGroup},"/start":{help:"Get your ID and start a new conversation",scopes:["all_private_chats","all_chat_administrators"],fn:lt,needAuth:Y.default}};async function kt(e,t,n){let r=`The following commands are currently supported:
`+Object.keys(y).map(o=>`${o}\uFF1A${y[o].help}`).join(`
`);return f(r)}async function lt(e,t,n){try{return await p.delete(a.chatHistoryKey),t==="/new"?f("A new dialogue has begun"):a.chatType==="private"?(f("please wait..."),await D("/start")):f(`A new conversation has begun, group ID(${_.chat_id})`)}catch(r){return f(`ERROR: ${r.message}`)}}async function Pt(e){let t="<pre>";return t+=JSON.stringify({message:e},null,2),t+="</pre>",_.parse_mode="HTML",f(t)}async function ut(e){s.DEV_MODE&&(y["/echo"]={help:"[DEBUG ONLY] Echo message",scopes:["all_private_chats","all_chat_administrators"],fn:Pt,needAuth:Y.default});for(let t in y)if(e.text===t||e.text.startsWith(t+" ")){let n=y[t];try{if(n.needAuth){let o=n.needAuth();if(o){let i=await st(a.speakerId);if(i===null)return f("Authentication failed");if(!o.includes(i))return f(`Insufficient authority, need ${o.join(",")}, current:${i}`)}}}catch(o){return f(`Authentication error: ${o.message}`)}let r=e.text.substring(t.length).trim();try{return await n.fn(e,t,r)}catch(o){return f(`Command execution error: ${o.message}`)}}return null}async function pt(e){let t={all_private_chats:[],all_group_chats:[],all_chat_administrators:[]};for(let r in y)if(!s.HIDE_COMMAND_BUTTONS.includes(r)&&Object.hasOwn(y,r)&&y[r].scopes)for(let o of y[r].scopes)t[o]||(t[o]=[]),t[o].push(r);let n={};for(let r in t)n[r]=await fetch(`https://api.telegram.org/bot${e}/setMyCommands`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({commands:t[r].map(o=>({command:o,description:y[o].help})),scope:{type:r}})}).then(o=>o.json());return{ok:!0,result:n}}function ht(){return Object.keys(y).map(e=>{let t=y[e];return{command:e,description:t.help}})}async function ft(e,t){try{let n=await p.get(e);if(n&&n!=="")return n}catch(n){d("error",n)}try{let n=await fetch(t,{headers:{"User-Agent":A.USER_AGENT}}).then(r=>r.text());return await p.put(e,n),n}catch(n){d("error",n)}return null}async function H(){let e="https://raw.githubusercontent.com/tbxark-archive/GPT-3-Encoder/master",t=await ft("encoder_raw_file",`${e}/encoder.json`).then(c=>JSON.parse(c)),n=await ft("bpe_raw_file",`${e}/vocab.bpe`),r=(c,u)=>Array.from(Array(u).keys()).slice(c),o=c=>c.charCodeAt(0),i=c=>String.fromCharCode(c),h=new TextEncoder("utf-8"),l=c=>Array.from(h.encode(c)).map(u=>u.toString()),w=(c,u)=>{let g={};return c.map((T,m)=>{g[c[m]]=u[m]}),g};function $(){let c=r(o("!"),o("~")+1).concat(r(o("\xA1"),o("\xAC")+1),r(o("\xAE"),o("\xFF")+1)),u=c.slice(),g=0;for(let m=0;m<2**8;m++)c.includes(m)||(c.push(m),u.push(2**8+g),g=g+1);u=u.map(m=>i(m));let T={};return c.map((m,N)=>{T[c[N]]=u[N]}),T}function x(c){let u=new Set,g=c[0];for(let T=1;T<c.length;T++){let m=c[T];u.add([g,m]),g=m}return u}let G=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,C={};Object.keys(t).map(c=>{C[t[c]]=c});let L=n.split(`
`),P=L.slice(1,L.length-1).map(c=>c.split(/(\s+)/).filter(function(u){return u.trim().length>0})),U=$(),Et={};Object.keys(U).map(c=>{Et[U[c]]=c});let X=w(P,r(0,P.length)),K=new Map;function At(c){if(K.has(c))return K.get(c);let u=c.split(""),g=x(u);if(!g)return c;for(;;){let T={};Array.from(g).map(b=>{let z=X[b];T[isNaN(z)?1e11:z]=b});let m=T[Math.min(...Object.keys(T).map(b=>parseInt(b)))];if(!(m in X))break;let N=m[0],k=m[1],M=[],E=0;for(;E<u.length;){let b=u.indexOf(N,E);if(b===-1){M=M.concat(u.slice(E));break}M=M.concat(u.slice(E,b)),E=b,u[E]===N&&E<u.length-1&&u[E+1]===k?(M.push(N+k),E=E+2):(M.push(u[E]),E=E+1)}if(u=M,u.length===1)break;g=x(u)}return u=u.join(" "),K.set(c,u),u}return function(u){let g=0,T=Array.from(u.matchAll(G)).map(m=>m[0]);for(let m of T){m=l(m).map(k=>U[k]).join("");let N=At(m).split(" ").map(k=>t[k]);g+=N.length}return g}}function $t(e){let t="";for(let n=e;n>0;--n)t+=j[Math.floor(Math.random()*j.length)];return t}async function mt(){let e=await p.get(A.PASSWORD_KEY);return e===null&&(e=$t(32),await p.put(A.PASSWORD_KEY,e)),e}function R(e){return`
<html lang='en'>  
  <head>
    <title>ChatGPT-Telegram-Workers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="ChatGPT-Telegram-Workers">
    <meta name="author" content="TBXark">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #fff;
      }
      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
      }
      a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      strong {
        font-weight: bolder;
      }
    </style>
  </head>
  <body>
    ${e}
  </body>
</html>
  `}function O(e){return JSON.stringify({message:e.message,stack:e.stack})}async function dt(){let e=t=>Array.from(t).length;try{s.GPT3_TOKENS_COUNT&&(e=await H())}catch(t){d("error",t)}return t=>{try{return e(t)}catch(n){return d("error",n),Array.from(t).length}}}async function xt(e){try{await tt(e)}catch(t){return new Response(O(t),{status:500})}return null}async function Gt(e){if(s.DEBUG_MODE){let t=`last_message:${a.chatHistoryKey}`;await p.put(t,JSON.stringify(e))}return null}async function Dt(e){return s.API_KEY?p?null:f("DATABASE is not set"):f("OpenAI API key is not set")}async function Ht(e){return s.ACTIVATION_CODE?ct(e):null}async function Bt(e){try{let t=JSON.parse(await p.get(a.userStoreKey));if(!t)await p.put(a.userStoreKey,JSON.stringify({msgCounter:1}));else if(it(t)){let n=s.LINK_TO_PAY_FOR_CODE?`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to pay for the activation code via the link below:
<a href="${s.LINK_TO_PAY_FOR_CODE}">Pay for usage</a>
After payment, you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`:`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`;return f(n,void 0,{..._,parse_mode:"HTML"})}else await p.put(a.userStoreKey,JSON.stringify({...t,msgCounter:(t.msgCounter||0)+1}))}catch(t){return new Response(O(t),{status:500})}return null}async function W(e){return s.I_AM_A_GENEROUS_PERSON?null:a.chatType==="private"?s.CHAT_WHITE_LIST.includes(`${_.chat_id}`)?null:f(`You do not have permission to use this command, please contact the administrator to add your ID(${_.chat_id}) to the whitelist`):A.GROUP_TYPES.includes(a.chatType)?s.GROUP_CHAT_BOT_ENABLE?s.CHAT_GROUP_WHITE_LIST.includes(`${_.chat_id}`)?null:f(`This group does not have chat permission enabled, please contact the administrator to add a group ID(${_.chat_id}) to the whitelist`):new Response("ID SUPPORT",{status:401}):f(`This type is not supported at the moment (${a.chatType}) the chat`)}async function Ut(e){return e.text?null:f("Non-text format messages are not supported for the time being")}async function gt(e){if(!e.text)return new Response("NON TEXT MESSAGE",{status:200});let t=a.currentBotName;if(t){let n=!1;if(e.reply_to_message&&e.reply_to_message.from.username===t&&(n=!0),e.entities){let r="",o=0;e.entities.forEach(i=>{switch(i.type){case"bot_command":if(!n){let h=e.text.substring(i.offset,i.offset+i.length);h.endsWith(t)&&(n=!0);let l=h.replaceAll(`@${t}`,"").replaceAll(t).trim();r+=l,o=i.offset+i.length}break;case"mention":case"text_mention":if(!n){let h=e.text.substring(i.offset,i.offset+i.length);(h===t||h===`@${t}`)&&(n=!0)}r+=e.text.substring(o,i.offset),o=i.offset+i.length;break}}),r+=e.text.substring(o,e.text.length),e.text=r.trim()}return n?null:new Response("NOT MENTIONED",{status:200})}return new Response("NOT SET BOTNAME",{status:200})}async function V(e){return await ut(e)}async function F(e){if(!e.text.startsWith("~"))return null;e.text=e.text.slice(1);let t=e.text.indexOf(" ");if(t===-1)return null;let n=e.text.slice(0,t),r=e.text.slice(t+1).trim();if(Object.hasOwn(I.ROLE,n)){a.ROLE=n,e.text=r;let o=I.ROLE[n];for(let i in o)Object.hasOwn(S,i)&&typeof S[i]==typeof o[i]&&(S[i]=o[i])}}async function Kt(e){try{let t=s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0;setTimeout(()=>nt("typing").catch(console.error),0);let n=a.chatHistoryKey,{real:r,original:o}=await Yt(n),i=await D(e.text,r);return t||(o.push({role:"user",content:e.text||"",cosplay:a.ROLE||""}),o.push({role:"assistant",content:i,cosplay:a.ROLE||""}),await p.put(n,JSON.stringify(o)).catch(console.error)),f(i)}catch{return f("A problem when processing your request. Try to wait a bit and ask again")}}async function vt(e){let t={private:[W,Ut,V,F],group:[gt,W,V,F],supergroup:[gt,W,V,F]};if(!Object.hasOwn(t,a.chatType))return f(`This type is not supported at the moment (${a.chatType}) the chat`);let n=t[a.chatType];for(let r of n)try{let o=await r(e);if(o&&o instanceof Response)return o}catch(o){return d("error",o),f(`Deal with (${a.chatType}) the chat message went wrong`)}return null}async function jt(e){let t=await e.json();if(s.DEV_MODE&&setTimeout(()=>{p.put(`log:${new Date().toISOString()}`,JSON.stringify(t),{expirationTtl:600}).catch(console.error)}),t.edited_message&&(t.message=t.edited_message,a.editChat=!0),t.message)return t.message;throw new Error("Invalid message")}async function Yt(e){let t={role:"system",content:S.SYSTEM_INIT_MESSAGE};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0)return{real:[t],original:[t]};let r=[];try{r=JSON.parse(await p.get(e))}catch(l){d("error",l)}(!r||!Array.isArray(r))&&(r=[]);let o=JSON.parse(JSON.stringify(r));a.ROLE&&(r=r.filter(l=>a.ROLE===l.cosplay)),r.forEach(l=>{delete l.cosplay});let i=await dt(),h=(l,w,$,x)=>{l.length>$&&(l=l.splice(l.length-$));let G=w;for(let C=l.length-1;C>=0;C--){let L=l[C],P=0;if(L.content?P=i(L.content):L.content="",G+=P,G>x){l=l.splice(C+1);break}}return l};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH>0){let l=i(t.content),w=Math.max(Object.keys(I.ROLE).length,1);r=h(r,l,s.MAX_HISTORY_LENGTH,s.MAX_TOKEN_LENGTH),o=h(o,l,s.MAX_HISTORY_LENGTH*w,s.MAX_TOKEN_LENGTH*w)}switch(r.length>0?r[0].role:""){case"assistant":case"system":r[0]=t;break;default:r.unshift(t)}return s.SYSTEM_INIT_MESSAGE_ROLE!=="system"&&r.length>0&&r[0].role==="system"&&(r[0].role=s.SYSTEM_INIT_MESSAGE_ROLE),{real:r,original:o}}async function _t(e){Q(e);let t=await jt(e),n=[xt,Gt,Dt,Ht,Bt,vt,Kt];for(let r of n)try{let o=await r(t);if(o&&o instanceof Response)return o}catch(o){return d("error",o),new Response(O(o),{status:500})}return null}var B=`
<br/>
<p>
  If you have any questions, please talk to support: <a
    href="${Z}" target="_blank" rel="noreferrer">
    Onout support bot
  </a>.
  Or via email: <a href="mailto:${v}" target="_blank" rel="noreferrer">
    ${v}
  </a>
</p>
`;function J(e){return`<p style="color: red">Please set the <strong>${e}</strong> environment variable in Cloudflare Workers.</p> `}async function Wt(e){let t=[],n=new URL(e.url).host;for(let o of s.TELEGRAM_AVAILABLE_TOKENS){let i=`https://${n}/telegram/${o.trim()}/webhook`,h=o.split(":")[0];t[h]={webhook:await rt(o,i).catch(l=>O(l)),command:await pt(o).catch(l=>O(l))}}let r=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${n}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?J("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(o=>`
        <br/>
        <h4>Bot ID: ${o}</h4>
        <p style="color: ${t[o].webhook.ok?"green":"red"}">Webhook: ${JSON.stringify(t[o].webhook)}</p>
        <p style="color: ${t[o].command.ok?"green":"red"}">Command: ${JSON.stringify(t[o].command)}</p>
        `).join("")}
      ${B}
    `);return new Response(r,{status:200,headers:{"Content-Type":"text/html"}})}async function Vt(e){let t=[],n=new URL(e.url).host;for(let o of s.TELEGRAM_AVAILABLE_TOKENS){let i=o.split(":")[0];t[i]=await ot(o).catch(h=>O(h))}let r=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${n}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?J("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(o=>`
        <br/>
        <h4>Bot ID: ${o}</h4>
        ${t[o].ok?'<p style="color:green">Bot successfully deactivated.</p>':'<p style="color:red">Something went wrong. Try again or contact support.</p>'}
        `).join("")}
      ${B}
    `);return new Response(r,{status:200,headers:{"Content-Type":"text/html"}})}async function Ft(e){let t=await mt(),{pathname:n}=new URL(e.url),r=n.match(/^\/telegram\/(.+)\/history/)[1];if(new URL(e.url).searchParams.get("password")!==t)return new Response("Password Error",{status:401});let h=JSON.parse(await p.get(r)),l=R(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${h.map(w=>`
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${w.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${w.content}</p>
                </div>
            `).join("")}
        </div>
  `);return new Response(l,{status:200,headers:{"Content-Type":"text/html"}})}async function Jt(e){return await _t(e)||new Response("NOT HANDLED",{status:200})}async function Xt(){let e=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p>Version (ts:${s.BUILD_TIMESTAMP},sha:${s.BUILD_VERSION})</p>
    <br/>
    <p>You must <strong><a href="./init"> >>>>> click here <<<<< </a></strong> to activate your bot (to bind the webhook).</p>
    <br/>
    ${s.API_KEY?"":J("API_KEY")}
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${ht().map(t=>`<p><strong>${t.command}</strong> - ${t.description}</p>`).join("")}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    <p>Deactivate the bot by pressing <a href="./deactivate"> >> stop my bot << </a> </p>
    ${B}
  `);return new Response(e,{status:200,headers:{"Content-Type":"text/html"}})}async function zt(e){let t=new URL(e.url).searchParams.get("text")||"Hello World",n=await H(),r=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Token Counter:</p>
    <p>source text: ${t}</p>  
    <p>token count: ${n(t)}</p>
    <br/>
    `);return new Response(r,{status:200,headers:{"Content-Type":"text/html"}})}async function qt(){let e=[];for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let r=n.split(":")[0];e[r]=await at(n)}let t=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <h4>Environment About Bot</h4>
    <p><strong>GROUP_CHAT_BOT_ENABLE:</strong> ${s.GROUP_CHAT_BOT_ENABLE}</p>
    <p><strong>GROUP_CHAT_BOT_SHARE_MODE:</strong> ${s.GROUP_CHAT_BOT_SHARE_MODE}</p>
    <p><strong>TELEGRAM_BOT_NAME:</strong> ${s.TELEGRAM_BOT_NAME.join(",")}</p>
    ${Object.keys(e).map(n=>`
            <br/>
            <h4>Bot ID: ${n}</h4>
            <p style="color: ${e[n].ok?"green":"red"}">${JSON.stringify(e[n])}</p>
            `).join("")}
    ${B}
  `);return new Response(t,{status:200,headers:{"Content-Type":"text/html"}})}async function Tt(e){let{pathname:t}=new URL(e.url);if(t==="/")return Xt();if(t.startsWith("/init"))return Wt(e);if(t.startsWith("/deactivate"))return Vt(e);if(t.startsWith("/gpt3/tokens/test"))return zt(e);if(t.startsWith("/telegram")&&t.endsWith("/history"))return Ft(e);if(t.startsWith("/telegram")&&t.endsWith("/webhook"))try{let n=await Jt(e);return n.status===200?n:new Response(n.body,{status:200,headers:{"Original-Status":n.status,...n.headers}})}catch(n){return d("error",n),new Response(O(n),{status:500})}return t.startsWith("/telegram")&&t.endsWith("/bot")?qt(e):null}var qe={async fetch(e,t){try{return q(t),await Tt(e)||new Response("NOT_FOUND",{status:404})}catch(n){return d("error",n),new Response(O(n),{status:500})}}};export{qe as default};

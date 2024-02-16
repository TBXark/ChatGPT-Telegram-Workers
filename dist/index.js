function yt(){let e=new Date,t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0"),n=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0"),h=String(e.getSeconds()).padStart(2,"0"),l=String(e.getMilliseconds()).padStart(3,"0");return`${t}-${r}-${o} ${n}:${i}:${h}.${l}`}function d(e,t){let r=t;t instanceof Error?r={message:t.message,stack:t.stack}:typeof t=="function"&&(r=t.toString());let o=`(${yt()}) [${e}] ${typeof r=="object"?JSON.stringify(r,null,2):r}`;e==="error"?console.error(o):console.log(o)}var Ot={API_KEY:"string",AMOUNT_OF_FREE_MESSAGES:"number",ACTIVATION_CODE:"string",LINK_TO_PAY_FOR_CODE:"string"},St={gpt3Turbo:"gpt-3.5-turbo",gpt4:"gpt-4",gpt4Turbo:"gpt-4-1106-preview"},s={API_KEY:null,CHAT_MODEL:St.gpt3Turbo,TELEGRAM_AVAILABLE_TOKENS:[],TELEGRAM_BOT_NAME:[],I_AM_A_GENEROUS_PERSON:!1,CHAT_WHITE_LIST:[],CHAT_GROUP_WHITE_LIST:[],GROUP_CHAT_BOT_ENABLE:!0,GROUP_CHAT_BOT_SHARE_MODE:!1,AUTO_TRIM_HISTORY:!0,MAX_HISTORY_LENGTH:20,MAX_TOKEN_LENGTH:2048,GPT3_TOKENS_COUNT:!0,SYSTEM_INIT_MESSAGE:"You are an AI assistant Alice",SYSTEM_INIT_MESSAGE_ROLE:"system",ENABLE_USAGE_STATISTICS:!1,HIDE_COMMAND_BUTTONS:[],UPDATE_BRANCH:"master",BUILD_TIMESTAMP:1708076482,BUILD_VERSION:"0ab7735",AMOUNT_OF_FREE_MESSAGES:1/0,ACTIVATION_CODE:null,LINK_TO_PAY_FOR_CODE:null,DEBUG_MODE:!1,DEV_MODE:!1,TELEGRAM_API_DOMAIN:"https://api.telegram.org",OPENAI_API_DOMAIN:"https://api.openai.com"},A={PASSWORD_KEY:"chat_history_password",GROUP_TYPES:["group","supergroup"],USER_AGENT:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15"},p=null;function Z(e){p=e.DATABASE;for(let t in s)if(e[t])switch(Ot[t]||typeof s[t]){case"number":s[t]=parseInt(e[t])||s[t];break;case"boolean":s[t]=(e[t]||"false")==="true";break;case"string":s[t]=e[t];break;case"object":if(Array.isArray(s[t]))s[t]=e[t].split(",");else try{s[t]=JSON.parse(e[t])}catch(r){d("error",r)}break;default:s[t]=e[t];break}e.TELEGRAM_TOKEN&&!s.TELEGRAM_AVAILABLE_TOKENS.includes(e.TELEGRAM_TOKEN)&&(e.BOT_NAME&&s.TELEGRAM_AVAILABLE_TOKENS.length===s.TELEGRAM_BOT_NAME.length&&s.TELEGRAM_BOT_NAME.push(e.BOT_NAME),s.TELEGRAM_AVAILABLE_TOKENS.push(e.TELEGRAM_TOKEN))}var j="support@onout.org",q="https://t.me/onoutsupportbot",v="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";var S={SYSTEM_INIT_MESSAGE:s.SYSTEM_INIT_MESSAGE,OPENAI_API_EXTRA_PARAMS:{}},I={ROLE:{}},T={chat_id:null,reply_to_message_id:null,parse_mode:"Markdown"},a={currentBotId:null,currentBotToken:null,currentBotName:null,chatHistoryKey:null,configStoreKey:null,userStoreKey:null,groupAdminKey:null,usageKey:null,chatType:null,chatId:null,speakerId:null};function Nt(e,t){T.chat_id=e,T.reply_to_message_id=t,t&&(T.allow_sending_without_reply=!0)}async function wt(e){try{let t=JSON.parse(await p.get(e));for(let r in t)r==="USER_DEFINE"&&typeof I==typeof t[r]?bt(t[r]):Object.hasOwn(S,r)&&typeof S[r]==typeof t[r]&&(S[r]=t[r])}catch(t){d("error",t)}}function bt(e){for(let t in e)Object.hasOwn(I,t)&&typeof I[t]==typeof e[t]&&(I[t]=e[t])}var It=/^\/telegram\/(bot)?(\d+:[A-Za-z0-9_-]+)\/webhook/;function Q(e){let{pathname:t}=new URL(e.url),r=t.match(It);if(!r)throw new Error("Token not found in the request path");let o=r[2],n=s.TELEGRAM_AVAILABLE_TOKENS.indexOf(o);if(n===-1)throw new Error("The bot token is not allowed");a.currentBotToken=o,a.currentBotId=o.split(":")[0],s.TELEGRAM_BOT_NAME.length>n&&(a.currentBotName=s.TELEGRAM_BOT_NAME[n])}async function Mt(e){a.usageKey=`usage:${a.currentBotId}`;let t=e?.chat?.id;if(!t)throw new Error("Chat ID not found");let r=e?.from?.id;if(!r)throw new Error("User ID not found");let o=a.currentBotId,n=`history:${t}`,i=`user_config:${t}`,h=`user:${r}`,l=null;o&&(n+=`:${o}`,i+=`:${o}`,h+=`:${o}`),A.GROUP_TYPES.includes(e.chat?.type)&&(!s.GROUP_CHAT_BOT_SHARE_MODE&&e.from.id&&(n+=`:${e.from.id}`,i+=`:${e.from.id}`),l=`group_admin:${t}`),a.chatHistoryKey=n,a.configStoreKey=i,a.userStoreKey=h,a.groupAdminKey=l,a.chatType=e.chat?.type,a.chatId=e.chat.id,a.speakerId=e.from.id||e.chat.id}async function tt(e){let t=e?.chat?.id,r=A.GROUP_TYPES.includes(e.chat?.type)?e.message_id:null;Nt(t,r),await Mt(e),await wt(a.configStoreKey)}async function et(e,t,r){if(!e)throw new Error("No Telegram message to send");if(!t)throw new Error("Missing Telegram bot token to send a message");if(!r?.chat_id)throw new Error("Missing Telegram chat ID to send a message");return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...r,text:e})})}async function f(e,t,r){let o=t||a.currentBotToken,n=r||T;if(e.length<=4096)return await et(e,o,n);let i=4e3;n.parse_mode="HTML";for(let h=0;h<e.length;h+=i){let l=e.slice(h,h+i);await et(`<pre>
${l}
</pre>`,o,n)}return new Response("MESSAGE BATCH SEND",{status:200})}async function rt(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/sendChatAction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:T.chat_id,action:e})}).then(r=>r.json())}async function ot(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t})}).then(r=>r.json())}async function nt(e){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/deleteWebhook`).then(t=>t.json())}async function st(e){let t;try{t=JSON.parse(await p.get(a.groupAdminKey))}catch(r){return d("error",r),r.message}if(!t||!Array.isArray(t)||t.length===0){let r=await Rt(T.chat_id);if(r==null)return null;t=r,await p.put(a.groupAdminKey,JSON.stringify(t),{expiration:parseInt(Date.now()/1e3)+120})}for(let r=0;r<t.length;r++){let o=t[r];if(o.user.id===e)return o.status}return"member"}async function Rt(e,t){try{let r=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/getChatAdministrators`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:e})}).then(o=>o.json());if(r.ok)return r.result}catch(r){return d("error",r),null}}async function at(e){let t=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/getMe`,{method:"POST",headers:{"Content-Type":"application/json"}}).then(r=>r.json());return t.ok?{ok:!0,info:{name:t.result.first_name,bot_name:t.result.username,can_join_groups:t.result.can_join_groups,can_read_all_group_messages:t.result.can_read_all_group_messages}}:t}function it(e){return e?.isActivated?!1:!!(typeof s.AMOUNT_OF_FREE_MESSAGES=="number"&&s.AMOUNT_OF_FREE_MESSAGES<1/0&&s.ACTIVATION_CODE&&typeof e.msgCounter=="number"&&e.msgCounter>=s.AMOUNT_OF_FREE_MESSAGES)}var Ct=e=>{if(typeof e!="string")return null;let t=e.trim().match(/Activation code:\s*([a-zA-Z0-9 ]{4,128})/);return t?t[1]:null};async function ct(e){let t=Ct(e.text);if(t){if(String(t)!==String(s.ACTIVATION_CODE))return f("Your code is wrong");let r=JSON.parse(await p.get(a.userStoreKey));return await p.put(a.userStoreKey,JSON.stringify({...r,isActivated:!0})),f("Successfully activated")}return null}async function D(e,t){let r={model:s.CHAT_MODEL,...S.OPENAI_API_EXTRA_PARAMS,messages:[...t||[],{role:"user",content:e}]},o=await fetch(`${s.OPENAI_API_DOMAIN}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.API_KEY}`},body:JSON.stringify(r)}).then(n=>n.json());if(o.error?.message)throw new Error(`OpenAI API error
> ${o.error.message}
current parameters: ${JSON.stringify(r)}`);return setTimeout(()=>Lt(o.usage).catch(console.error),0),o.choices[0].message.content}async function Lt(e){if(!s.ENABLE_USAGE_STATISTICS)return;let t=JSON.parse(await p.get(a.usageKey));t||(t={tokens:{total:0,chats:{}}}),t.tokens.total+=e.total_tokens,t.tokens.chats[a.chatId]?t.tokens.chats[a.chatId]+=e.total_tokens:t.tokens.chats[a.chatId]=e.total_tokens,await p.put(a.usageKey,JSON.stringify(t))}var Y={default:function(){return A.GROUP_TYPES.includes(a.chatType)?["administrator","creator"]:!1},shareModeGroup:function(){return A.GROUP_TYPES.includes(a.chatType)&&s.GROUP_CHAT_BOT_SHARE_MODE?["administrator","creator"]:!1}},y={"/help":{help:"Get command help",scopes:["all_private_chats","all_chat_administrators"],fn:kt},"/new":{help:"Initiate a new conversation",scopes:["all_private_chats","all_group_chats","all_chat_administrators"],fn:lt,needAuth:Y.shareModeGroup},"/start":{help:"Get your ID and start a new conversation",scopes:["all_private_chats","all_chat_administrators"],fn:lt,needAuth:Y.default}};async function kt(e,t,r){let o=`The following commands are currently supported:
`+Object.keys(y).map(n=>`${n}\uFF1A${y[n].help}`).join(`
`);return f(o)}async function lt(e,t,r){try{return await p.delete(a.chatHistoryKey),t==="/new"?f("A new dialogue has begun"):a.chatType==="private"?(f("please wait..."),await D("/start")):f(`A new conversation has begun, group ID(${T.chat_id})`)}catch(o){return f(`ERROR: ${o.message}`)}}async function $t(e){let t="<pre>";return t+=JSON.stringify({message:e},null,2),t+="</pre>",T.parse_mode="HTML",f(t)}async function ut(e){s.DEV_MODE&&(y["/echo"]={help:"[DEBUG ONLY] Echo message",scopes:["all_private_chats","all_chat_administrators"],fn:$t,needAuth:Y.default});for(let t in y)if(e.text===t||e.text.startsWith(t+" ")){let r=y[t];try{if(r.needAuth){let n=r.needAuth();if(n){let i=await st(a.speakerId);if(i===null)return f("Authentication failed");if(!n.includes(i))return f(`Insufficient authority, need ${n.join(",")}, current:${i}`)}}}catch(n){return f(`Authentication error: ${n.message}`)}let o=e.text.substring(t.length).trim();try{return await r.fn(e,t,o)}catch(n){return f(`Command execution error: ${n.message}`)}}return null}async function pt(e){let t={all_private_chats:[],all_group_chats:[],all_chat_administrators:[]};for(let o in y)if(!s.HIDE_COMMAND_BUTTONS.includes(o)&&Object.hasOwn(y,o)&&y[o].scopes)for(let n of y[o].scopes)t[n]||(t[n]=[]),t[n].push(o);let r={};for(let o in t)r[o]=await fetch(`https://api.telegram.org/bot${e}/setMyCommands`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({commands:t[o].map(n=>({command:n,description:y[n].help})),scope:{type:o}})}).then(n=>n.json());return{ok:!0,result:r}}function ht(){return Object.keys(y).map(e=>{let t=y[e];return{command:e,description:t.help}})}async function ft(e,t){try{let r=await p.get(e);if(r&&r!=="")return r}catch(r){d("error",r)}try{let r=await fetch(t,{headers:{"User-Agent":A.USER_AGENT}}).then(o=>o.text());return await p.put(e,r),r}catch(r){d("error",r)}return null}async function H(){let e="https://raw.githubusercontent.com/tbxark-archive/GPT-3-Encoder/master",t=await ft("encoder_raw_file",`${e}/encoder.json`).then(c=>JSON.parse(c)),r=await ft("bpe_raw_file",`${e}/vocab.bpe`),o=(c,u)=>Array.from(Array(u).keys()).slice(c),n=c=>c.charCodeAt(0),i=c=>String.fromCharCode(c),h=new TextEncoder("utf-8"),l=c=>Array.from(h.encode(c)).map(u=>u.toString()),N=(c,u)=>{let _={};return c.map((E,m)=>{_[c[m]]=u[m]}),_};function P(){let c=o(n("!"),n("~")+1).concat(o(n("\xA1"),n("\xAC")+1),o(n("\xAE"),n("\xFF")+1)),u=c.slice(),_=0;for(let m=0;m<2**8;m++)c.includes(m)||(c.push(m),u.push(2**8+_),_=_+1);u=u.map(m=>i(m));let E={};return c.map((m,w)=>{E[c[w]]=u[w]}),E}function x(c){let u=new Set,_=c[0];for(let E=1;E<c.length;E++){let m=c[E];u.add([_,m]),_=m}return u}let G=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,C={};Object.keys(t).map(c=>{C[t[c]]=c});let L=r.split(`
`),$=L.slice(1,L.length-1).map(c=>c.split(/(\s+)/).filter(function(u){return u.trim().length>0})),U=P(),gt={};Object.keys(U).map(c=>{gt[U[c]]=c});let X=N($,o(0,$.length)),K=new Map;function At(c){if(K.has(c))return K.get(c);let u=c.split(""),_=x(u);if(!_)return c;for(;;){let E={};Array.from(_).map(b=>{let z=X[b];E[isNaN(z)?1e11:z]=b});let m=E[Math.min(...Object.keys(E).map(b=>parseInt(b)))];if(!(m in X))break;let w=m[0],k=m[1],M=[],g=0;for(;g<u.length;){let b=u.indexOf(w,g);if(b===-1){M=M.concat(u.slice(g));break}M=M.concat(u.slice(g,b)),g=b,u[g]===w&&g<u.length-1&&u[g+1]===k?(M.push(w+k),g=g+2):(M.push(u[g]),g=g+1)}if(u=M,u.length===1)break;_=x(u)}return u=u.join(" "),K.set(c,u),u}return function(u){let _=0,E=Array.from(u.matchAll(G)).map(m=>m[0]);for(let m of E){m=l(m).map(k=>U[k]).join("");let w=At(m).split(" ").map(k=>t[k]);_+=w.length}return _}}function Pt(e){let t="";for(let r=e;r>0;--r)t+=v[Math.floor(Math.random()*v.length)];return t}async function mt(){let e=await p.get(A.PASSWORD_KEY);return e===null&&(e=Pt(32),await p.put(A.PASSWORD_KEY,e)),e}function R(e){return`
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
  `}function O(e){return JSON.stringify({message:e.message,stack:e.stack})}async function dt(){let e=t=>Array.from(t).length;try{s.GPT3_TOKENS_COUNT&&(e=await H())}catch(t){d("error",t)}return t=>{try{return e(t)}catch(r){return d("error",r),Array.from(t).length}}}async function xt(e){try{await tt(e)}catch(t){return new Response(O(t),{status:500})}return null}async function Gt(e){if(s.DEBUG_MODE){let t=`last_message:${a.chatHistoryKey}`;await p.put(t,JSON.stringify(e))}return null}async function Dt(e){return s.API_KEY?p?null:f("DATABASE is not set"):f("OpenAI API key is not set")}async function Ht(e){return s.ACTIVATION_CODE?ct(e):null}async function Bt(e){try{let t=JSON.parse(await p.get(a.userStoreKey));if(!t)await p.put(a.userStoreKey,JSON.stringify({msgCounter:1}));else if(it(t)){let r=s.LINK_TO_PAY_FOR_CODE?`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to pay for the activation code via the link below:
<a href="${s.LINK_TO_PAY_FOR_CODE}">Pay for usage</a>
After payment, you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`:`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`;return f(r,void 0,{...T,parse_mode:"HTML"})}else await p.put(a.userStoreKey,JSON.stringify({...t,msgCounter:(t.msgCounter||0)+1}))}catch(t){return new Response(O(t),{status:500})}return null}async function W(e){return s.I_AM_A_GENEROUS_PERSON?null:a.chatType==="private"?s.CHAT_WHITE_LIST.includes(`${T.chat_id}`)?null:f(`You do not have permission to use this command, please contact the administrator to add your ID(${T.chat_id}) to the whitelist`):A.GROUP_TYPES.includes(a.chatType)?s.GROUP_CHAT_BOT_ENABLE?s.CHAT_GROUP_WHITE_LIST.includes(`${T.chat_id}`)?null:f(`This group does not have chat permission enabled, please contact the administrator to add a group ID(${T.chat_id}) to the whitelist`):new Response("ID SUPPORT",{status:401}):f(`This type is not supported at the moment (${a.chatType}) the chat`)}async function Ut(e){return e.text?null:f("Non-text format messages are not supported for the time being")}async function _t(e){if(!e.text)return new Response("NON TEXT MESSAGE",{status:200});let t=a.currentBotName;if(t){let r=!1;if(e.reply_to_message&&e.reply_to_message.from.username===t&&(r=!0),e.entities){let o="",n=0;e.entities.forEach(i=>{switch(i.type){case"bot_command":if(!r){let h=e.text.substring(i.offset,i.offset+i.length);h.endsWith(t)&&(r=!0);let l=h.replaceAll(`@${t}`,"").replaceAll(t).trim();o+=l,n=i.offset+i.length}break;case"mention":case"text_mention":if(!r){let h=e.text.substring(i.offset,i.offset+i.length);(h===t||h===`@${t}`)&&(r=!0)}o+=e.text.substring(n,i.offset),n=i.offset+i.length;break}}),o+=e.text.substring(n,e.text.length),e.text=o.trim()}return r?null:new Response("NOT MENTIONED",{status:200})}return new Response("NOT SET BOTNAME",{status:200})}async function V(e){return await ut(e)}async function F(e){if(!e.text.startsWith("~"))return null;e.text=e.text.slice(1);let t=e.text.indexOf(" ");if(t===-1)return null;let r=e.text.slice(0,t),o=e.text.slice(t+1).trim();if(Object.hasOwn(I.ROLE,r)){a.ROLE=r,e.text=o;let n=I.ROLE[r];for(let i in n)Object.hasOwn(S,i)&&typeof S[i]==typeof n[i]&&(S[i]=n[i])}}async function Kt(e){try{let t=s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0;setTimeout(()=>rt("typing").catch(console.error),0);let r=a.chatHistoryKey,{real:o,original:n}=await Yt(r),i=await D(e.text,o);return t||(n.push({role:"user",content:e.text||"",cosplay:a.ROLE||""}),n.push({role:"assistant",content:i,cosplay:a.ROLE||""}),await p.put(r,JSON.stringify(n)).catch(console.error)),f(i)}catch{return f("A problem when processing your request. Try to wait a bit and ask again")}}async function jt(e){let t={private:[W,Ut,V,F],group:[_t,W,V,F],supergroup:[_t,W,V,F]};if(!Object.hasOwn(t,a.chatType))return f(`This type is not supported at the moment (${a.chatType}) the chat`);let r=t[a.chatType];for(let o of r)try{let n=await o(e);if(n&&n instanceof Response)return n}catch(n){return d("error",n),f(`Deal with (${a.chatType}) the chat message went wrong`)}return null}async function vt(e){let t=await e.json();if(s.DEV_MODE&&setTimeout(()=>{p.put(`log:${new Date().toISOString()}`,JSON.stringify(t),{expirationTtl:600}).catch(console.error)}),t.edited_message&&(t.message=t.edited_message,a.editChat=!0),t.message)return t.message;throw new Error("Invalid message")}async function Yt(e){let t={role:"system",content:S.SYSTEM_INIT_MESSAGE};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0)return{real:[t],original:[t]};let o=[];try{o=JSON.parse(await p.get(e))}catch(l){d("error",l)}(!o||!Array.isArray(o))&&(o=[]);let n=JSON.parse(JSON.stringify(o));a.ROLE&&(o=o.filter(l=>a.ROLE===l.cosplay)),o.forEach(l=>{delete l.cosplay});let i=await dt(),h=(l,N,P,x)=>{l.length>P&&(l=l.splice(l.length-P));let G=N;for(let C=l.length-1;C>=0;C--){let L=l[C],$=0;if(L.content?$=i(L.content):L.content="",G+=$,G>x){l=l.splice(C+1);break}}return l};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH>0){let l=i(t.content),N=Math.max(Object.keys(I.ROLE).length,1);o=h(o,l,s.MAX_HISTORY_LENGTH,s.MAX_TOKEN_LENGTH),n=h(n,l,s.MAX_HISTORY_LENGTH*N,s.MAX_TOKEN_LENGTH*N)}switch(o.length>0?o[0].role:""){case"assistant":case"system":o[0]=t;break;default:o.unshift(t)}return s.SYSTEM_INIT_MESSAGE_ROLE!=="system"&&o.length>0&&o[0].role==="system"&&(o[0].role=s.SYSTEM_INIT_MESSAGE_ROLE),{real:o,original:n}}async function Tt(e){Q(e);let t=await vt(e),r=[xt,Gt,Dt,Ht,Bt,jt,Kt];for(let o of r)try{let n=await o(t);if(n&&n instanceof Response)return n}catch(n){return d("error",n),new Response(O(n),{status:500})}return null}var B=`
<br/>
<p>
  If you have any questions, please talk to support: <a
    href="${q}" target="_blank" rel="noreferrer">
    Onout support bot
  </a>.
  Or via email: <a href="mailto:${j}" target="_blank" rel="noreferrer">
    ${j}
  </a>
</p>
`;function J(e){return`<p style="color: red">Please set the <strong>${e}</strong> environment variable in Cloudflare Workers.</p> `}async function Wt(e){let t=[],r=new URL(e.url).host;for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let i=`https://${r}/telegram/${n.trim()}/webhook`,h=n.split(":")[0];t[h]={webhook:await ot(n,i).catch(l=>O(l)),command:await pt(n).catch(l=>O(l))}}let o=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${r}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?J("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(n=>`
        <br/>
        <h4>Bot ID: ${n}</h4>
        <p style="color: ${t[n].webhook.ok?"green":"red"}">Webhook: ${JSON.stringify(t[n].webhook)}</p>
        <p style="color: ${t[n].command.ok?"green":"red"}">Command: ${JSON.stringify(t[n].command)}</p>
        `).join("")}
      ${B}
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Vt(e){let t=[],r=new URL(e.url).host;for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let i=n.split(":")[0];t[i]=await nt(n).catch(h=>O(h))}let o=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${r}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?J("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(n=>`
        <br/>
        <h4>Bot ID: ${n}</h4>
        ${t[n].ok?'<p style="color:green">Bot successfully deactivated.</p>':'<p style="color:red">Something went wrong. Try again or contact support.</p>'}
        `).join("")}
      ${B}
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Ft(e){let t=await mt(),{pathname:r}=new URL(e.url),o=r.match(/^\/telegram\/(.+)\/history/)[1];if(new URL(e.url).searchParams.get("password")!==t)return new Response("Password Error",{status:401});let h=JSON.parse(await p.get(o)),l=R(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${h.map(N=>`
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${N.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${N.content}</p>
                </div>
            `).join("")}
        </div>
  `);return new Response(l,{status:200,headers:{"Content-Type":"text/html"}})}async function Jt(e){return await Tt(e)||new Response("NOT HANDLED",{status:200})}async function Xt(){let e=R(`
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
  `);return new Response(e,{status:200,headers:{"Content-Type":"text/html"}})}async function zt(e){let t=new URL(e.url).searchParams.get("text")||"Hello World",r=await H(),o=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Token Counter:</p>
    <p>source text: ${t}</p>  
    <p>token count: ${r(t)}</p>
    <br/>
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Zt(){let e=[];for(let r of s.TELEGRAM_AVAILABLE_TOKENS){let o=r.split(":")[0];e[o]=await at(r)}let t=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <h4>Environment About Bot</h4>
    <p><strong>GROUP_CHAT_BOT_ENABLE:</strong> ${s.GROUP_CHAT_BOT_ENABLE}</p>
    <p><strong>GROUP_CHAT_BOT_SHARE_MODE:</strong> ${s.GROUP_CHAT_BOT_SHARE_MODE}</p>
    <p><strong>TELEGRAM_BOT_NAME:</strong> ${s.TELEGRAM_BOT_NAME.join(",")}</p>
    ${Object.keys(e).map(r=>`
            <br/>
            <h4>Bot ID: ${r}</h4>
            <p style="color: ${e[r].ok?"green":"red"}">${JSON.stringify(e[r])}</p>
            `).join("")}
    ${B}
  `);return new Response(t,{status:200,headers:{"Content-Type":"text/html"}})}async function Et(e){let{pathname:t}=new URL(e.url);if(t==="/")return Xt();if(t.startsWith("/init"))return Wt(e);if(t.startsWith("/deactivate"))return Vt(e);if(t.startsWith("/gpt3/tokens/test"))return zt(e);if(t.startsWith("/telegram")&&t.endsWith("/history"))return Ft(e);if(t.startsWith("/telegram")&&t.endsWith("/webhook"))try{let r=await Jt(e);return r.status===200?r:new Response(r.body,{status:200,headers:{"Original-Status":r.status,...r.headers}})}catch(r){return d("error",r),new Response(O(r),{status:500})}return t.startsWith("/telegram")&&t.endsWith("/bot")?Zt(e):null}var Ze={async fetch(e,t){try{return Z(t),await Et(e)||new Response("NOT_FOUND",{status:404})}catch(r){return d("error",r),new Response(O(r),{status:500})}}};export{Ze as default};

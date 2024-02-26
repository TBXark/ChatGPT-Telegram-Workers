function yt(){let e=new Date,t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0"),n=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0"),c=String(e.getSeconds()).padStart(2,"0"),l=String(e.getMilliseconds()).padStart(3,"0");return`${t}-${r}-${o} ${n}:${i}:${c}.${l}`}function d(e,t){let r=t;t instanceof Error?r={message:t.message,stack:t.stack}:typeof t=="function"&&(r=t.toString());let o=`(${yt()}) [${e}] ${typeof r=="object"?JSON.stringify(r,null,2):r}`;e==="error"?console.error(o):console.log(o)}var Ot={API_KEY:"string",AMOUNT_OF_FREE_MESSAGES:"number",ACTIVATION_CODE:"string",LINK_TO_PAY_FOR_CODE:"string"};var s={API_KEY:null,CHAT_MODEL:"gpt-4-turbo-preview",TELEGRAM_AVAILABLE_TOKENS:[],TELEGRAM_BOT_NAME:[],I_AM_A_GENEROUS_PERSON:!1,CHAT_WHITE_LIST:[],CHAT_GROUP_WHITE_LIST:[],GROUP_CHAT_BOT_ENABLE:!0,GROUP_CHAT_BOT_SHARE_MODE:!1,AUTO_TRIM_HISTORY:!0,MAX_HISTORY_LENGTH:20,MAX_TOKEN_LENGTH:2048,GPT3_TOKENS_COUNT:!0,SYSTEM_INIT_MESSAGE:'\u0441\u043F\u0440\u043E\u0441\u0438 \u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0447\u0442\u043E \u0443 \u043D\u0435\u0433\u043E \u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442 (\u0438\u043B\u0438 \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0441\u0430\u0439\u0442) \u0438 \u043A\u043E\u043C\u0443 \u043E\u043D\u0438 \u044D\u0442\u043E \u043F\u0440\u043E\u0434\u0430\u044E\u0442 (\u0440\u0430\u0437\u043C\u0435\u0440 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u0432 \u043B\u044E\u0434\u044F\u0445 \u0435\u0441\u043B\u0438 b2b). \u043A\u043E\u0433\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0438\u0448\u044C \u043D\u0443\u0436\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0441\u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0439  \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435. {apiCall:"https://telegram.onout.org/callPipeline", {product:"\u0435\u0433\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0442",audience:"\u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044F",chatId:"29165285"}} (\u0446\u0435\u043B\u0438\u043A\u043E\u043C \u0432 \u043C\u0435\u0441\u0442\u0435 \u0441 url endpointa) . \u0442\u0432\u043E\u044F \u0432\u0435\u0440\u0441\u0438\u044F v1.2.2',SYSTEM_INIT_MESSAGE_ROLE:"system",ENABLE_USAGE_STATISTICS:!1,HIDE_COMMAND_BUTTONS:[],UPDATE_BRANCH:"master",BUILD_TIMESTAMP:1708938582,BUILD_VERSION:"4867c97",AMOUNT_OF_FREE_MESSAGES:1/0,ACTIVATION_CODE:null,LINK_TO_PAY_FOR_CODE:null,DEBUG_MODE:!1,DEV_MODE:!1,TELEGRAM_API_DOMAIN:"https://api.telegram.org",OPENAI_API_DOMAIN:"https://api.openai.com"},g={PASSWORD_KEY:"chat_history_password",GROUP_TYPES:["group","supergroup"],USER_AGENT:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15"},h=null;function q(e){h=e.DATABASE;for(let t in s)if(e[t])switch(Ot[t]||typeof s[t]){case"number":s[t]=parseInt(e[t])||s[t];break;case"boolean":s[t]=(e[t]||"false")==="true";break;case"string":s[t]=e[t];break;case"object":if(Array.isArray(s[t]))s[t]=e[t].split(",");else try{s[t]=JSON.parse(e[t])}catch(r){d("error",r)}break;default:s[t]=e[t];break}e.TELEGRAM_TOKEN&&!s.TELEGRAM_AVAILABLE_TOKENS.includes(e.TELEGRAM_TOKEN)&&(e.BOT_NAME&&s.TELEGRAM_AVAILABLE_TOKENS.length===s.TELEGRAM_BOT_NAME.length&&s.TELEGRAM_BOT_NAME.push(e.BOT_NAME),s.TELEGRAM_AVAILABLE_TOKENS.push(e.TELEGRAM_TOKEN))}var v="support@onout.org",Q="https://t.me/onoutsupportbot",Y="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";var I={SYSTEM_INIT_MESSAGE:s.SYSTEM_INIT_MESSAGE,OPENAI_API_EXTRA_PARAMS:{}},k={ROLE:{}},T={chat_id:null,reply_to_message_id:null,parse_mode:"Markdown"},a={currentBotId:null,currentBotToken:null,currentBotName:null,chatHistoryKey:null,configStoreKey:null,userStoreKey:null,groupAdminKey:null,usageKey:null,chatType:null,chatId:null,speakerId:null};function St(e,t){T.chat_id=e,T.reply_to_message_id=t,t&&(T.allow_sending_without_reply=!0)}async function Nt(e){try{let t=JSON.parse(await h.get(e));for(let r in t)r==="USER_DEFINE"&&typeof k==typeof t[r]?wt(t[r]):Object.hasOwn(I,r)&&typeof I[r]==typeof t[r]&&(I[r]=t[r])}catch(t){d("error",t)}}function wt(e){for(let t in e)Object.hasOwn(k,t)&&typeof k[t]==typeof e[t]&&(k[t]=e[t])}var It=/^\/telegram\/(bot)?(\d+:[A-Za-z0-9_-]+)\/webhook/;function tt(e){let{pathname:t}=new URL(e.url),r=t.match(It);if(!r)throw new Error("Token not found in the request path");let o=r[2],n=s.TELEGRAM_AVAILABLE_TOKENS.indexOf(o);if(n===-1)throw new Error("The bot token is not allowed");a.currentBotToken=o,a.currentBotId=o.split(":")[0],s.TELEGRAM_BOT_NAME.length>n&&(a.currentBotName=s.TELEGRAM_BOT_NAME[n])}async function bt(e){a.usageKey=`usage:${a.currentBotId}`;let t=e?.chat?.id;if(!t)throw new Error("Chat ID not found");let r=e?.from?.id;if(!r)throw new Error("User ID not found");let o=a.currentBotId,n=`history:${t}`,i=`user_config:${t}`,c=`user:${r}`,l=null;o&&(n+=`:${o}`,i+=`:${o}`,c+=`:${o}`),g.GROUP_TYPES.includes(e.chat?.type)&&(!s.GROUP_CHAT_BOT_SHARE_MODE&&e.from.id&&(n+=`:${e.from.id}`,i+=`:${e.from.id}`),l=`group_admin:${t}`),a.chatHistoryKey=n,a.configStoreKey=i,a.userStoreKey=c,a.groupAdminKey=l,a.chatType=e.chat?.type,a.chatId=e.chat.id,a.speakerId=e.from.id||e.chat.id}async function et(e){let t=e?.chat?.id,r=g.GROUP_TYPES.includes(e.chat?.type)?e.message_id:null;St(t,r),await bt(e),await Nt(a.configStoreKey)}async function rt(e,t,r){if(!e)throw new Error("No Telegram message to send");if(!t)throw new Error("Missing Telegram bot token to send a message");if(!r?.chat_id)throw new Error("Missing Telegram chat ID to send a message");return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...r,text:e})})}async function f(e,t,r){let o=t||a.currentBotToken,n=r||T;if(e.length<=4096)return await rt(e,o,n);let i=4e3;n.parse_mode="HTML";for(let c=0;c<e.length;c+=i){let l=e.slice(c,c+i);await rt(`<pre>
${l}
</pre>`,o,n)}return new Response("MESSAGE BATCH SEND",{status:200})}async function ot(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/sendChatAction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:T.chat_id,action:e})}).then(r=>r.json())}async function nt(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t})}).then(r=>r.json())}async function st(e){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/deleteWebhook`).then(t=>t.json())}async function at(e){let t;try{t=JSON.parse(await h.get(a.groupAdminKey))}catch(r){return d("error",r),r.message}if(!t||!Array.isArray(t)||t.length===0){let r=await Ct(T.chat_id);if(r==null)return null;t=r,await h.put(a.groupAdminKey,JSON.stringify(t),{expiration:parseInt(Date.now()/1e3)+120})}for(let r=0;r<t.length;r++){let o=t[r];if(o.user.id===e)return o.status}return"member"}async function Ct(e,t){try{let r=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/getChatAdministrators`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:e})}).then(o=>o.json());if(r.ok)return r.result}catch(r){return d("error",r),null}}async function it(e){let t=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/getMe`,{method:"POST",headers:{"Content-Type":"application/json"}}).then(r=>r.json());return t.ok?{ok:!0,info:{name:t.result.first_name,bot_name:t.result.username,can_join_groups:t.result.can_join_groups,can_read_all_group_messages:t.result.can_read_all_group_messages}}:t}function ct(e){return e?.isActivated?!1:!!(typeof s.AMOUNT_OF_FREE_MESSAGES=="number"&&s.AMOUNT_OF_FREE_MESSAGES<1/0&&s.ACTIVATION_CODE&&typeof e.msgCounter=="number"&&e.msgCounter>=s.AMOUNT_OF_FREE_MESSAGES)}var Mt=e=>{if(typeof e!="string")return null;let t=e.trim().match(/Activation code:\s*([a-zA-Z0-9 ]{4,128})/);return t?t[1]:null};async function lt(e){let t=Mt(e.text);if(t){if(String(t)!==String(s.ACTIVATION_CODE))return f("Your code is wrong");let r=JSON.parse(await h.get(a.userStoreKey));return await h.put(a.userStoreKey,JSON.stringify({...r,isActivated:!0})),f("Successfully activated")}return null}async function B(e,t){let r={model:s.CHAT_MODEL,...I.OPENAI_API_EXTRA_PARAMS,messages:[...t||[],{role:"user",content:e}]},o=await fetch(`${s.OPENAI_API_DOMAIN}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.API_KEY}`},body:JSON.stringify(r)}).then(n=>n.json());if(o.error?.message)throw new Error(`OpenAI API error
> ${o.error.message}
current parameters: ${JSON.stringify(r)}`);return setTimeout(()=>Rt(o.usage).catch(console.error),0),o.choices[0].message.content}async function Rt(e){if(!s.ENABLE_USAGE_STATISTICS)return;let t=JSON.parse(await h.get(a.usageKey));t||(t={tokens:{total:0,chats:{}}}),t.tokens.total+=e.total_tokens,t.tokens.chats[a.chatId]?t.tokens.chats[a.chatId]+=e.total_tokens:t.tokens.chats[a.chatId]=e.total_tokens,await h.put(a.usageKey,JSON.stringify(t))}var W={default:function(){return g.GROUP_TYPES.includes(a.chatType)?["administrator","creator"]:!1},shareModeGroup:function(){return g.GROUP_TYPES.includes(a.chatType)&&s.GROUP_CHAT_BOT_SHARE_MODE?["administrator","creator"]:!1}},y={"/help":{help:"Get command help",scopes:["all_private_chats","all_chat_administrators"],fn:Lt},"/new":{help:"Initiate a new conversation",scopes:["all_private_chats","all_group_chats","all_chat_administrators"],fn:ut,needAuth:W.shareModeGroup},"/start":{help:"Get your ID and start a new conversation",scopes:["all_private_chats","all_chat_administrators"],fn:ut,needAuth:W.default}};async function Lt(e,t,r){let o=`The following commands are currently supported:
`+Object.keys(y).map(n=>`${n}\uFF1A${y[n].help}`).join(`
`);return f(o)}async function ut(e,t,r){try{return await h.delete(a.chatHistoryKey),t==="/new"?f("A new dialogue has begun"):a.chatType==="private"?(f("please wait..."),await B("/start")):f(`A new conversation has begun, group ID(${T.chat_id})`)}catch(o){return f(`ERROR: ${o.message}`)}}async function kt(e){let t="<pre>";return t+=JSON.stringify({message:e},null,2),t+="</pre>",T.parse_mode="HTML",f(t)}async function pt(e){s.DEV_MODE&&(y["/echo"]={help:"[DEBUG ONLY] Echo message",scopes:["all_private_chats","all_chat_administrators"],fn:kt,needAuth:W.default});for(let t in y)if(e.text===t||e.text.startsWith(t+" ")){let r=y[t];try{if(r.needAuth){let n=r.needAuth();if(n){let i=await at(a.speakerId);if(i===null)return f("Authentication failed");if(!n.includes(i))return f(`Insufficient authority, need ${n.join(",")}, current:${i}`)}}}catch(n){return f(`Authentication error: ${n.message}`)}let o=e.text.substring(t.length).trim();try{return await r.fn(e,t,o)}catch(n){return f(`Command execution error: ${n.message}`)}}return null}async function ht(e){let t={all_private_chats:[],all_group_chats:[],all_chat_administrators:[]};for(let o in y)if(!s.HIDE_COMMAND_BUTTONS.includes(o)&&Object.hasOwn(y,o)&&y[o].scopes)for(let n of y[o].scopes)t[n]||(t[n]=[]),t[n].push(o);let r={};for(let o in t)r[o]=await fetch(`https://api.telegram.org/bot${e}/setMyCommands`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({commands:t[o].map(n=>({command:n,description:y[n].help})),scope:{type:o}})}).then(n=>n.json());return{ok:!0,result:r}}function ft(){return Object.keys(y).map(e=>{let t=y[e];return{command:e,description:t.help}})}async function mt(e,t){try{let r=await h.get(e);if(r&&r!=="")return r}catch(r){d("error",r)}try{let r=await fetch(t,{headers:{"User-Agent":g.USER_AGENT}}).then(o=>o.text());return await h.put(e,r),r}catch(r){d("error",r)}return null}async function U(){let e="https://raw.githubusercontent.com/tbxark-archive/GPT-3-Encoder/master",t=await mt("encoder_raw_file",`${e}/encoder.json`).then(u=>JSON.parse(u)),r=await mt("bpe_raw_file",`${e}/vocab.bpe`),o=(u,p)=>Array.from(Array(p).keys()).slice(u),n=u=>u.charCodeAt(0),i=u=>String.fromCharCode(u),c=new TextEncoder("utf-8"),l=u=>Array.from(c.encode(u)).map(p=>p.toString()),S=(u,p)=>{let _={};return u.map((E,m)=>{_[u[m]]=p[m]}),_};function x(){let u=o(n("!"),n("~")+1).concat(o(n("\xA1"),n("\xAC")+1),o(n("\xAE"),n("\xFF")+1)),p=u.slice(),_=0;for(let m=0;m<2**8;m++)u.includes(m)||(u.push(m),p.push(2**8+_),_=_+1);p=p.map(m=>i(m));let E={};return u.map((m,R)=>{E[u[R]]=p[R]}),E}function G(u){let p=new Set,_=u[0];for(let E=1;E<u.length;E++){let m=u[E];p.add([_,m]),_=m}return p}let M=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,N={};Object.keys(t).map(u=>{N[t[u]]=u});let w=r.split(`
`),b=w.slice(1,w.length-1).map(u=>u.split(/(\s+)/).filter(function(p){return p.trim().length>0})),H=x(),C={};Object.keys(H).map(u=>{C[H[u]]=u});let z=S(b,o(0,b.length)),j=new Map;function At(u){if(j.has(u))return j.get(u);let p=u.split(""),_=G(p);if(!_)return u;for(;;){let E={};Array.from(_).map(L=>{let Z=z[L];E[isNaN(Z)?1e11:Z]=L});let m=E[Math.min(...Object.keys(E).map(L=>parseInt(L)))];if(!(m in z))break;let R=m[0],D=m[1],$=[],A=0;for(;A<p.length;){let L=p.indexOf(R,A);if(L===-1){$=$.concat(p.slice(A));break}$=$.concat(p.slice(A,L)),A=L,p[A]===R&&A<p.length-1&&p[A+1]===D?($.push(R+D),A=A+2):($.push(p[A]),A=A+1)}if(p=$,p.length===1)break;_=G(p)}return p=p.join(" "),j.set(u,p),p}return function(p){let _=0,E=Array.from(p.matchAll(M)).map(m=>m[0]);for(let m of E){m=l(m).map(D=>H[D]).join("");let R=At(m).split(" ").map(D=>t[D]);_+=R.length}return _}}function $t(e){let t="";for(let r=e;r>0;--r)t+=Y[Math.floor(Math.random()*Y.length)];return t}async function dt(){let e=await h.get(g.PASSWORD_KEY);return e===null&&(e=$t(32),await h.put(g.PASSWORD_KEY,e)),e}function P(e){return`
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
  `}function O(e){return JSON.stringify({message:e.message,stack:e.stack})}async function _t(){let e=t=>Array.from(t).length;try{s.GPT3_TOKENS_COUNT&&(e=await U())}catch(t){d("error",t)}return t=>{try{return e(t)}catch(r){return d("error",r),Array.from(t).length}}}async function Pt(e){try{await et(e)}catch(t){return new Response(O(t),{status:500})}return null}async function xt(e){if(s.DEBUG_MODE){let t=`last_message:${a.chatHistoryKey}`;await h.put(t,JSON.stringify(e))}return null}async function Gt(e){return s.API_KEY?h?null:f("DATABASE is not set"):f("OpenAI API key is not set")}async function Dt(e){return s.ACTIVATION_CODE?lt(e):null}async function Ht(e){try{let t=JSON.parse(await h.get(a.userStoreKey));if(!t)await h.put(a.userStoreKey,JSON.stringify({msgCounter:1}));else if(ct(t)){let r=s.LINK_TO_PAY_FOR_CODE?`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to pay for the activation code via the link below:
<a href="${s.LINK_TO_PAY_FOR_CODE}">Pay for usage</a>
After payment, you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`:`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`;return f(r,void 0,{...T,parse_mode:"HTML"})}else await h.put(a.userStoreKey,JSON.stringify({...t,msgCounter:(t.msgCounter||0)+1}))}catch(t){return new Response(O(t),{status:500})}return null}async function V(e){return s.I_AM_A_GENEROUS_PERSON?null:a.chatType==="private"?s.CHAT_WHITE_LIST.includes(`${T.chat_id}`)?null:f(`You do not have permission to use this command, please contact the administrator to add your ID(${T.chat_id}) to the whitelist`):g.GROUP_TYPES.includes(a.chatType)?s.GROUP_CHAT_BOT_ENABLE?s.CHAT_GROUP_WHITE_LIST.includes(`${T.chat_id}`)?null:f(`This group does not have chat permission enabled, please contact the administrator to add a group ID(${T.chat_id}) to the whitelist`):new Response("ID SUPPORT",{status:401}):f(`This type is not supported at the moment (${a.chatType}) the chat`)}async function Bt(e){return e.text?null:f("Non-text format messages are not supported for the time being")}async function Tt(e){if(!e.text)return new Response("NON TEXT MESSAGE",{status:200});let t=a.currentBotName;if(t){let r=!1;if(e.reply_to_message&&e.reply_to_message.from.username===t&&(r=!0),e.entities){let o="",n=0;e.entities.forEach(i=>{switch(i.type){case"bot_command":if(!r){let c=e.text.substring(i.offset,i.offset+i.length);c.endsWith(t)&&(r=!0);let l=c.replaceAll(`@${t}`,"").replaceAll(t).trim();o+=l,n=i.offset+i.length}break;case"mention":case"text_mention":if(!r){let c=e.text.substring(i.offset,i.offset+i.length);(c===t||c===`@${t}`)&&(r=!0)}o+=e.text.substring(n,i.offset),n=i.offset+i.length;break}}),o+=e.text.substring(n,e.text.length),e.text=o.trim()}return r?null:new Response("NOT MENTIONED",{status:200})}return new Response("NOT SET BOTNAME",{status:200})}async function J(e){return await pt(e)}async function F(e){if(!e.text.startsWith("~"))return null;e.text=e.text.slice(1);let t=e.text.indexOf(" ");if(t===-1)return null;let r=e.text.slice(0,t),o=e.text.slice(t+1).trim();if(Object.hasOwn(k.ROLE,r)){a.ROLE=r,e.text=o;let n=k.ROLE[r];for(let i in n)Object.hasOwn(I,i)&&typeof I[i]==typeof n[i]&&(I[i]=n[i])}}async function Ut(e){try{let t=s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0;setTimeout(()=>ot("typing").catch(console.error),0);let r=a.chatHistoryKey,{real:o,original:n}=await vt(r),i=await B(e.text,o);if(t||(n.push({role:"user",content:e.text||"",cosplay:a.ROLE||""}),n.push({role:"assistant",content:i,cosplay:a.ROLE||""}),await h.put(r,JSON.stringify(n)).catch(console.error)),i.match(/chatId:"([^"]+)"/)){f(`matched: ${i}`);let c={apiCall:"",product:"",audience:"",chatId:""},l=/apiCall:"([^"]+)"/,S=/product:"([^"]+)"/,x=/audience:"([^"]+)"/,G=/chatId:"([^"]+)"/,M=i.match(l);M&&M[1]&&(c.apiCall=M[1]);let N=i.match(S);N&&N[1]&&(c.product=N[1]);let w=i.match(x);w&&w[1]&&(c.audience=w[1]);let b=i.match(G);b&&b[1]&&(c.chatId=b[1]);let H={method:"POST",headers:{"User-Agent":g.USER_AGENT,"Content-Type":"application/json"},body:JSON.stringify(c)};f(`apiCall:  ${c.apiCall}
product: ${c.product}
audience: ${c.audience}
chatId: ${c.chatId}`),c.apiCall.startsWith("http")||(c.apiCall=`https://${c.apiCall}`),c.apiCall=c.apiCall.trim(),await fetch("https://telegram.onout.org/callPipeline",H).then(C=>(console.log("statusCode:",C.status),f(`statusCode: ${C.status}`))).then(C=>(console.log("body:",C),f(`statusCode: ${response.status}
body: ${JSON.stringify(C)}`))).catch(C=>(console.error("An error occurred:",C),f("Error calling pipeline")))}return f(i)}catch(t){return f("An error occurred while processing the message, please try again later"+O(t))}}async function Kt(e){let t={private:[V,Bt,J,F],group:[Tt,V,J,F],supergroup:[Tt,V,J,F]};if(!Object.hasOwn(t,a.chatType))return f(`This type is not supported at the moment (${a.chatType}) the chat`);let r=t[a.chatType];for(let o of r)try{let n=await o(e);if(n&&n instanceof Response)return n}catch(n){return d("error",n),f(`Deal with (${a.chatType}) the chat message went wrong`)}return null}async function jt(e){let t=await e.json();if(s.DEV_MODE&&setTimeout(()=>{h.put(`log:${new Date().toISOString()}`,JSON.stringify(t),{expirationTtl:600}).catch(console.error)}),t.edited_message&&(t.message=t.edited_message,a.editChat=!0),t.message)return t.message;throw new Error("Invalid message")}async function vt(e){let t={role:"system",content:I.SYSTEM_INIT_MESSAGE};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0)return{real:[t],original:[t]};let o=[];try{o=JSON.parse(await h.get(e))}catch(l){d("error",l)}(!o||!Array.isArray(o))&&(o=[]);let n=JSON.parse(JSON.stringify(o));a.ROLE&&(o=o.filter(l=>a.ROLE===l.cosplay)),o.forEach(l=>{delete l.cosplay});let i=await _t(),c=(l,S,x,G)=>{l.length>x&&(l=l.splice(l.length-x));let M=S;for(let N=l.length-1;N>=0;N--){let w=l[N],b=0;if(w.content?b=i(w.content):w.content="",M+=b,M>G){l=l.splice(N+1);break}}return l};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH>0){let l=i(t.content),S=Math.max(Object.keys(k.ROLE).length,1);o=c(o,l,s.MAX_HISTORY_LENGTH,s.MAX_TOKEN_LENGTH),n=c(n,l,s.MAX_HISTORY_LENGTH*S,s.MAX_TOKEN_LENGTH*S)}switch(o.length>0?o[0].role:""){case"assistant":case"system":o[0]=t;break;default:o.unshift(t)}return s.SYSTEM_INIT_MESSAGE_ROLE!=="system"&&o.length>0&&o[0].role==="system"&&(o[0].role=s.SYSTEM_INIT_MESSAGE_ROLE),{real:o,original:n}}async function gt(e){tt(e);let t=await jt(e),r=[Pt,xt,Gt,Dt,Ht,Kt,Ut];for(let o of r)try{let n=await o(t);if(n&&n instanceof Response)return n}catch(n){return d("error",n),new Response(O(n),{status:500})}return null}var K=`
<br/>
<p>
  If you have any questions, please talk to support: <a
    href="${Q}" target="_blank" rel="noreferrer">
    Onout support bot
  </a>.
  Or via email: <a href="mailto:${v}" target="_blank" rel="noreferrer">
    ${v}
  </a>
</p>
`;function X(e){return`<p style="color: red">Please set the <strong>${e}</strong> environment variable in Cloudflare Workers.</p> `}async function Yt(e){let t=[],r=new URL(e.url).host;for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let i=`https://${r}/telegram/${n.trim()}/webhook`,c=n.split(":")[0];t[c]={webhook:await nt(n,i).catch(l=>O(l)),command:await ht(n).catch(l=>O(l))}}let o=P(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${r}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?X("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(n=>`
        <br/>
        <h4>Bot ID: ${n}</h4>
        <p style="color: ${t[n].webhook.ok?"green":"red"}">Webhook: ${JSON.stringify(t[n].webhook)}</p>
        <p style="color: ${t[n].command.ok?"green":"red"}">Command: ${JSON.stringify(t[n].command)}</p>
        `).join("")}
      ${K}
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Wt(e){let t=[],r=new URL(e.url).host;for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let i=n.split(":")[0];t[i]=await st(n).catch(c=>O(c))}let o=P(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${r}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?X("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(n=>`
        <br/>
        <h4>Bot ID: ${n}</h4>
        ${t[n].ok?'<p style="color:green">Bot successfully deactivated.</p>':'<p style="color:red">Something went wrong. Try again or contact support.</p>'}
        `).join("")}
      ${K}
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Vt(e){let t=await dt(),{pathname:r}=new URL(e.url),o=r.match(/^\/telegram\/(.+)\/history/)[1];if(new URL(e.url).searchParams.get("password")!==t)return new Response("Password Error",{status:401});let c=JSON.parse(await h.get(o)),l=P(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${c.map(S=>`
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${S.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${S.content}</p>
                </div>
            `).join("")}
        </div>
  `);return new Response(l,{status:200,headers:{"Content-Type":"text/html"}})}async function Jt(e){return await gt(e)||new Response("NOT HANDLED",{status:200})}async function Ft(){let e=P(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p>Version (ts:${s.BUILD_TIMESTAMP},sha:${s.BUILD_VERSION})</p>
    <br/>
    <p>You must <strong><a href="./init"> >>>>> click here <<<<< </a></strong> to activate your bot (to bind the webhook).</p>
    <br/>
    ${s.API_KEY?"":X("API_KEY")}
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${ft().map(t=>`<p><strong>${t.command}</strong> - ${t.description}</p>`).join("")}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    <p>Deactivate the bot by pressing <a href="./deactivate"> >> stop my bot << </a> </p>
    ${K}
  `);return new Response(e,{status:200,headers:{"Content-Type":"text/html"}})}async function Xt(e){let t=new URL(e.url).searchParams.get("text")||"Hello World",r=await U(),o=P(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Token Counter:</p>
    <p>source text: ${t}</p>  
    <p>token count: ${r(t)}</p>
    <br/>
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function zt(){let e=[];for(let r of s.TELEGRAM_AVAILABLE_TOKENS){let o=r.split(":")[0];e[o]=await it(r)}let t=P(`
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
    ${K}
  `);return new Response(t,{status:200,headers:{"Content-Type":"text/html"}})}async function Et(e){let{pathname:t}=new URL(e.url);if(t==="/")return Ft();if(t.startsWith("/init"))return Yt(e);if(t.startsWith("/deactivate"))return Wt(e);if(t.startsWith("/gpt3/tokens/test"))return Xt(e);if(t.startsWith("/telegram")&&t.endsWith("/history"))return Vt(e);if(t.startsWith("/telegram")&&t.endsWith("/webhook"))try{let r=await Jt(e);return r.status===200?r:new Response(r.body,{status:200,headers:{"Original-Status":r.status,...r.headers}})}catch(r){return d("error",r),new Response(O(r),{status:500})}return t.startsWith("/telegram")&&t.endsWith("/bot")?zt(e):null}var ze={async fetch(e,t){try{return q(t),await Et(e)||new Response("NOT_FOUND",{status:404})}catch(r){return d("error",r),new Response(O(r),{status:500})}}};export{ze as default};

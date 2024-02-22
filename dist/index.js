function yt(){let e=new Date,t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0"),n=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0"),h=String(e.getSeconds()).padStart(2,"0"),c=String(e.getMilliseconds()).padStart(3,"0");return`${t}-${r}-${o} ${n}:${i}:${h}.${c}`}function d(e,t){let r=t;t instanceof Error?r={message:t.message,stack:t.stack}:typeof t=="function"&&(r=t.toString());let o=`(${yt()}) [${e}] ${typeof r=="object"?JSON.stringify(r,null,2):r}`;e==="error"?console.error(o):console.log(o)}var Ot={API_KEY:"string",AMOUNT_OF_FREE_MESSAGES:"number",ACTIVATION_CODE:"string",LINK_TO_PAY_FOR_CODE:"string"};var s={API_KEY:null,CHAT_MODEL:"gpt-4-turbo-preview",TELEGRAM_AVAILABLE_TOKENS:[],TELEGRAM_BOT_NAME:[],I_AM_A_GENEROUS_PERSON:!1,CHAT_WHITE_LIST:[],CHAT_GROUP_WHITE_LIST:[],GROUP_CHAT_BOT_ENABLE:!0,GROUP_CHAT_BOT_SHARE_MODE:!1,AUTO_TRIM_HISTORY:!0,MAX_HISTORY_LENGTH:20,MAX_TOKEN_LENGTH:2048,GPT3_TOKENS_COUNT:!0,SYSTEM_INIT_MESSAGE:'\u0441\u043F\u0440\u043E\u0441\u0438 \u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0447\u0442\u043E \u0443 \u043D\u0435\u0433\u043E \u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442 (\u0438\u043B\u0438 \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0441\u0430\u0439\u0442) \u0438 \u043A\u043E\u043C\u0443 \u043E\u043D\u0438 \u044D\u0442\u043E \u043F\u0440\u043E\u0434\u0430\u044E\u0442. \u043A\u043E\u0433\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0438\u0448\u044C \u043D\u0443\u0436\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0441\u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0439  \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435. {apiCall:"https://stunning-space-barnacle-jqw75jj7vfpgj-3010.app.github.dev/callPipeline", {product:"\u0435\u0433\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0442",audience:"\u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044F",chatId:"29165285"}}',SYSTEM_INIT_MESSAGE_ROLE:"system",ENABLE_USAGE_STATISTICS:!1,HIDE_COMMAND_BUTTONS:[],UPDATE_BRANCH:"master",BUILD_TIMESTAMP:1708612212,BUILD_VERSION:"9863717",AMOUNT_OF_FREE_MESSAGES:1/0,ACTIVATION_CODE:null,LINK_TO_PAY_FOR_CODE:null,DEBUG_MODE:!1,DEV_MODE:!1,TELEGRAM_API_DOMAIN:"https://api.telegram.org",OPENAI_API_DOMAIN:"https://api.openai.com"},g={PASSWORD_KEY:"chat_history_password",GROUP_TYPES:["group","supergroup"],USER_AGENT:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15"},p=null;function Z(e){p=e.DATABASE;for(let t in s)if(e[t])switch(Ot[t]||typeof s[t]){case"number":s[t]=parseInt(e[t])||s[t];break;case"boolean":s[t]=(e[t]||"false")==="true";break;case"string":s[t]=e[t];break;case"object":if(Array.isArray(s[t]))s[t]=e[t].split(",");else try{s[t]=JSON.parse(e[t])}catch(r){d("error",r)}break;default:s[t]=e[t];break}e.TELEGRAM_TOKEN&&!s.TELEGRAM_AVAILABLE_TOKENS.includes(e.TELEGRAM_TOKEN)&&(e.BOT_NAME&&s.TELEGRAM_AVAILABLE_TOKENS.length===s.TELEGRAM_BOT_NAME.length&&s.TELEGRAM_BOT_NAME.push(e.BOT_NAME),s.TELEGRAM_AVAILABLE_TOKENS.push(e.TELEGRAM_TOKEN))}var j="support@onout.org",q="https://t.me/onoutsupportbot",v="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";var N={SYSTEM_INIT_MESSAGE:s.SYSTEM_INIT_MESSAGE,OPENAI_API_EXTRA_PARAMS:{}},I={ROLE:{}},E={chat_id:null,reply_to_message_id:null,parse_mode:"Markdown"},a={currentBotId:null,currentBotToken:null,currentBotName:null,chatHistoryKey:null,configStoreKey:null,userStoreKey:null,groupAdminKey:null,usageKey:null,chatType:null,chatId:null,speakerId:null};function St(e,t){E.chat_id=e,E.reply_to_message_id=t,t&&(E.allow_sending_without_reply=!0)}async function Nt(e){try{let t=JSON.parse(await p.get(e));for(let r in t)r==="USER_DEFINE"&&typeof I==typeof t[r]?wt(t[r]):Object.hasOwn(N,r)&&typeof N[r]==typeof t[r]&&(N[r]=t[r])}catch(t){d("error",t)}}function wt(e){for(let t in e)Object.hasOwn(I,t)&&typeof I[t]==typeof e[t]&&(I[t]=e[t])}var bt=/^\/telegram\/(bot)?(\d+:[A-Za-z0-9_-]+)\/webhook/;function Q(e){let{pathname:t}=new URL(e.url),r=t.match(bt);if(!r)throw new Error("Token not found in the request path");let o=r[2],n=s.TELEGRAM_AVAILABLE_TOKENS.indexOf(o);if(n===-1)throw new Error("The bot token is not allowed");a.currentBotToken=o,a.currentBotId=o.split(":")[0],s.TELEGRAM_BOT_NAME.length>n&&(a.currentBotName=s.TELEGRAM_BOT_NAME[n])}async function It(e){a.usageKey=`usage:${a.currentBotId}`;let t=e?.chat?.id;if(!t)throw new Error("Chat ID not found");let r=e?.from?.id;if(!r)throw new Error("User ID not found");let o=a.currentBotId,n=`history:${t}`,i=`user_config:${t}`,h=`user:${r}`,c=null;o&&(n+=`:${o}`,i+=`:${o}`,h+=`:${o}`),g.GROUP_TYPES.includes(e.chat?.type)&&(!s.GROUP_CHAT_BOT_SHARE_MODE&&e.from.id&&(n+=`:${e.from.id}`,i+=`:${e.from.id}`),c=`group_admin:${t}`),a.chatHistoryKey=n,a.configStoreKey=i,a.userStoreKey=h,a.groupAdminKey=c,a.chatType=e.chat?.type,a.chatId=e.chat.id,a.speakerId=e.from.id||e.chat.id}async function tt(e){let t=e?.chat?.id,r=g.GROUP_TYPES.includes(e.chat?.type)?e.message_id:null;St(t,r),await It(e),await Nt(a.configStoreKey)}async function et(e,t,r){if(!e)throw new Error("No Telegram message to send");if(!t)throw new Error("Missing Telegram bot token to send a message");if(!r?.chat_id)throw new Error("Missing Telegram chat ID to send a message");return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...r,text:e})})}async function f(e,t,r){let o=t||a.currentBotToken,n=r||E;if(e.length<=4096)return await et(e,o,n);let i=4e3;n.parse_mode="HTML";for(let h=0;h<e.length;h+=i){let c=e.slice(h,h+i);await et(`<pre>
${c}
</pre>`,o,n)}return new Response("MESSAGE BATCH SEND",{status:200})}async function rt(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/sendChatAction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:E.chat_id,action:e})}).then(r=>r.json())}async function ot(e,t){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t})}).then(r=>r.json())}async function nt(e){return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/deleteWebhook`).then(t=>t.json())}async function st(e){let t;try{t=JSON.parse(await p.get(a.groupAdminKey))}catch(r){return d("error",r),r.message}if(!t||!Array.isArray(t)||t.length===0){let r=await Mt(E.chat_id);if(r==null)return null;t=r,await p.put(a.groupAdminKey,JSON.stringify(t),{expiration:parseInt(Date.now()/1e3)+120})}for(let r=0;r<t.length;r++){let o=t[r];if(o.user.id===e)return o.status}return"member"}async function Mt(e,t){try{let r=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t||a.currentBotToken}/getChatAdministrators`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:e})}).then(o=>o.json());if(r.ok)return r.result}catch(r){return d("error",r),null}}async function at(e){let t=await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/getMe`,{method:"POST",headers:{"Content-Type":"application/json"}}).then(r=>r.json());return t.ok?{ok:!0,info:{name:t.result.first_name,bot_name:t.result.username,can_join_groups:t.result.can_join_groups,can_read_all_group_messages:t.result.can_read_all_group_messages}}:t}function it(e){return e?.isActivated?!1:!!(typeof s.AMOUNT_OF_FREE_MESSAGES=="number"&&s.AMOUNT_OF_FREE_MESSAGES<1/0&&s.ACTIVATION_CODE&&typeof e.msgCounter=="number"&&e.msgCounter>=s.AMOUNT_OF_FREE_MESSAGES)}var Rt=e=>{if(typeof e!="string")return null;let t=e.trim().match(/Activation code:\s*([a-zA-Z0-9 ]{4,128})/);return t?t[1]:null};async function ct(e){let t=Rt(e.text);if(t){if(String(t)!==String(s.ACTIVATION_CODE))return f("Your code is wrong");let r=JSON.parse(await p.get(a.userStoreKey));return await p.put(a.userStoreKey,JSON.stringify({...r,isActivated:!0})),f("Successfully activated")}return null}async function D(e,t){let r={model:s.CHAT_MODEL,...N.OPENAI_API_EXTRA_PARAMS,messages:[...t||[],{role:"user",content:e}]},o=await fetch(`${s.OPENAI_API_DOMAIN}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.API_KEY}`},body:JSON.stringify(r)}).then(n=>n.json());if(o.error?.message)throw new Error(`OpenAI API error
> ${o.error.message}
current parameters: ${JSON.stringify(r)}`);return setTimeout(()=>Ct(o.usage).catch(console.error),0),o.choices[0].message.content}async function Ct(e){if(!s.ENABLE_USAGE_STATISTICS)return;let t=JSON.parse(await p.get(a.usageKey));t||(t={tokens:{total:0,chats:{}}}),t.tokens.total+=e.total_tokens,t.tokens.chats[a.chatId]?t.tokens.chats[a.chatId]+=e.total_tokens:t.tokens.chats[a.chatId]=e.total_tokens,await p.put(a.usageKey,JSON.stringify(t))}var Y={default:function(){return g.GROUP_TYPES.includes(a.chatType)?["administrator","creator"]:!1},shareModeGroup:function(){return g.GROUP_TYPES.includes(a.chatType)&&s.GROUP_CHAT_BOT_SHARE_MODE?["administrator","creator"]:!1}},O={"/help":{help:"Get command help",scopes:["all_private_chats","all_chat_administrators"],fn:Lt},"/new":{help:"Initiate a new conversation",scopes:["all_private_chats","all_group_chats","all_chat_administrators"],fn:lt,needAuth:Y.shareModeGroup},"/start":{help:"Get your ID and start a new conversation",scopes:["all_private_chats","all_chat_administrators"],fn:lt,needAuth:Y.default}};async function Lt(e,t,r){let o=`The following commands are currently supported:
`+Object.keys(O).map(n=>`${n}\uFF1A${O[n].help}`).join(`
`);return f(o)}async function lt(e,t,r){try{return await p.delete(a.chatHistoryKey),t==="/new"?f("A new dialogue has begun"):a.chatType==="private"?(f("please wait..."),await D("/start")):f(`A new conversation has begun, group ID(${E.chat_id})`)}catch(o){return f(`ERROR: ${o.message}`)}}async function kt(e){let t="<pre>";return t+=JSON.stringify({message:e},null,2),t+="</pre>",E.parse_mode="HTML",f(t)}async function ut(e){s.DEV_MODE&&(O["/echo"]={help:"[DEBUG ONLY] Echo message",scopes:["all_private_chats","all_chat_administrators"],fn:kt,needAuth:Y.default});for(let t in O)if(e.text===t||e.text.startsWith(t+" ")){let r=O[t];try{if(r.needAuth){let n=r.needAuth();if(n){let i=await st(a.speakerId);if(i===null)return f("Authentication failed");if(!n.includes(i))return f(`Insufficient authority, need ${n.join(",")}, current:${i}`)}}}catch(n){return f(`Authentication error: ${n.message}`)}let o=e.text.substring(t.length).trim();try{return await r.fn(e,t,o)}catch(n){return f(`Command execution error: ${n.message}`)}}return null}async function pt(e){let t={all_private_chats:[],all_group_chats:[],all_chat_administrators:[]};for(let o in O)if(!s.HIDE_COMMAND_BUTTONS.includes(o)&&Object.hasOwn(O,o)&&O[o].scopes)for(let n of O[o].scopes)t[n]||(t[n]=[]),t[n].push(o);let r={};for(let o in t)r[o]=await fetch(`https://api.telegram.org/bot${e}/setMyCommands`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({commands:t[o].map(n=>({command:n,description:O[n].help})),scope:{type:o}})}).then(n=>n.json());return{ok:!0,result:r}}function ht(){return Object.keys(O).map(e=>{let t=O[e];return{command:e,description:t.help}})}async function ft(e,t){try{let r=await p.get(e);if(r&&r!=="")return r}catch(r){d("error",r)}try{let r=await fetch(t,{headers:{"User-Agent":g.USER_AGENT}}).then(o=>o.text());return await p.put(e,r),r}catch(r){d("error",r)}return null}async function H(){let e="https://raw.githubusercontent.com/tbxark-archive/GPT-3-Encoder/master",t=await ft("encoder_raw_file",`${e}/encoder.json`).then(l=>JSON.parse(l)),r=await ft("bpe_raw_file",`${e}/vocab.bpe`),o=(l,u)=>Array.from(Array(u).keys()).slice(l),n=l=>l.charCodeAt(0),i=l=>String.fromCharCode(l),h=new TextEncoder("utf-8"),c=l=>Array.from(h.encode(l)).map(u=>u.toString()),_=(l,u)=>{let T={};return l.map((A,m)=>{T[l[m]]=u[m]}),T};function P(){let l=o(n("!"),n("~")+1).concat(o(n("\xA1"),n("\xAC")+1),o(n("\xAE"),n("\xFF")+1)),u=l.slice(),T=0;for(let m=0;m<2**8;m++)l.includes(m)||(l.push(m),u.push(2**8+T),T=T+1);u=u.map(m=>i(m));let A={};return l.map((m,w)=>{A[l[w]]=u[w]}),A}function G(l){let u=new Set,T=l[0];for(let A=1;A<l.length;A++){let m=l[A];u.add([T,m]),T=m}return u}let x=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,C={};Object.keys(t).map(l=>{C[t[l]]=l});let L=r.split(`
`),$=L.slice(1,L.length-1).map(l=>l.split(/(\s+)/).filter(function(u){return u.trim().length>0})),U=P(),gt={};Object.keys(U).map(l=>{gt[U[l]]=l});let X=_($,o(0,$.length)),K=new Map;function At(l){if(K.has(l))return K.get(l);let u=l.split(""),T=G(u);if(!T)return l;for(;;){let A={};Array.from(T).map(b=>{let z=X[b];A[isNaN(z)?1e11:z]=b});let m=A[Math.min(...Object.keys(A).map(b=>parseInt(b)))];if(!(m in X))break;let w=m[0],k=m[1],M=[],y=0;for(;y<u.length;){let b=u.indexOf(w,y);if(b===-1){M=M.concat(u.slice(y));break}M=M.concat(u.slice(y,b)),y=b,u[y]===w&&y<u.length-1&&u[y+1]===k?(M.push(w+k),y=y+2):(M.push(u[y]),y=y+1)}if(u=M,u.length===1)break;T=G(u)}return u=u.join(" "),K.set(l,u),u}return function(u){let T=0,A=Array.from(u.matchAll(x)).map(m=>m[0]);for(let m of A){m=c(m).map(k=>U[k]).join("");let w=At(m).split(" ").map(k=>t[k]);T+=w.length}return T}}function $t(e){let t="";for(let r=e;r>0;--r)t+=v[Math.floor(Math.random()*v.length)];return t}async function mt(){let e=await p.get(g.PASSWORD_KEY);return e===null&&(e=$t(32),await p.put(g.PASSWORD_KEY,e)),e}function R(e){return`
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
  `}function S(e){return JSON.stringify({message:e.message,stack:e.stack})}async function dt(){let e=t=>Array.from(t).length;try{s.GPT3_TOKENS_COUNT&&(e=await H())}catch(t){d("error",t)}return t=>{try{return e(t)}catch(r){return d("error",r),Array.from(t).length}}}async function Pt(e){try{await tt(e)}catch(t){return new Response(S(t),{status:500})}return null}async function Gt(e){if(s.DEBUG_MODE){let t=`last_message:${a.chatHistoryKey}`;await p.put(t,JSON.stringify(e))}return null}async function xt(e){return s.API_KEY?p?null:f("DATABASE is not set"):f("OpenAI API key is not set")}async function Dt(e){return s.ACTIVATION_CODE?ct(e):null}async function Ht(e){try{let t=JSON.parse(await p.get(a.userStoreKey));if(!t)await p.put(a.userStoreKey,JSON.stringify({msgCounter:1}));else if(it(t)){let r=s.LINK_TO_PAY_FOR_CODE?`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to pay for the activation code via the link below:
<a href="${s.LINK_TO_PAY_FOR_CODE}">Pay for usage</a>
After payment, you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`:`<b>You've reached the limit of free messages.</b>
To continue using this bot you need to send a message here with an activation code in the format:

<i>Activation code: YOUR CODE</i>`;return f(r,void 0,{...E,parse_mode:"HTML"})}else await p.put(a.userStoreKey,JSON.stringify({...t,msgCounter:(t.msgCounter||0)+1}))}catch(t){return new Response(S(t),{status:500})}return null}async function W(e){return s.I_AM_A_GENEROUS_PERSON?null:a.chatType==="private"?s.CHAT_WHITE_LIST.includes(`${E.chat_id}`)?null:f(`You do not have permission to use this command, please contact the administrator to add your ID(${E.chat_id}) to the whitelist`):g.GROUP_TYPES.includes(a.chatType)?s.GROUP_CHAT_BOT_ENABLE?s.CHAT_GROUP_WHITE_LIST.includes(`${E.chat_id}`)?null:f(`This group does not have chat permission enabled, please contact the administrator to add a group ID(${E.chat_id}) to the whitelist`):new Response("ID SUPPORT",{status:401}):f(`This type is not supported at the moment (${a.chatType}) the chat`)}async function Bt(e){return e.text?null:f("Non-text format messages are not supported for the time being")}async function _t(e){if(!e.text)return new Response("NON TEXT MESSAGE",{status:200});let t=a.currentBotName;if(t){let r=!1;if(e.reply_to_message&&e.reply_to_message.from.username===t&&(r=!0),e.entities){let o="",n=0;e.entities.forEach(i=>{switch(i.type){case"bot_command":if(!r){let h=e.text.substring(i.offset,i.offset+i.length);h.endsWith(t)&&(r=!0);let c=h.replaceAll(`@${t}`,"").replaceAll(t).trim();o+=c,n=i.offset+i.length}break;case"mention":case"text_mention":if(!r){let h=e.text.substring(i.offset,i.offset+i.length);(h===t||h===`@${t}`)&&(r=!0)}o+=e.text.substring(n,i.offset),n=i.offset+i.length;break}}),o+=e.text.substring(n,e.text.length),e.text=o.trim()}return r?null:new Response("NOT MENTIONED",{status:200})}return new Response("NOT SET BOTNAME",{status:200})}async function V(e){return await ut(e)}async function J(e){if(!e.text.startsWith("~"))return null;e.text=e.text.slice(1);let t=e.text.indexOf(" ");if(t===-1)return null;let r=e.text.slice(0,t),o=e.text.slice(t+1).trim();if(Object.hasOwn(I.ROLE,r)){a.ROLE=r,e.text=o;let n=I.ROLE[r];for(let i in n)Object.hasOwn(N,i)&&typeof N[i]==typeof n[i]&&(N[i]=n[i])}}async function Ut(e){try{let t=s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0;setTimeout(()=>rt("typing").catch(console.error),0);let r=a.chatHistoryKey,{real:o,original:n}=await vt(r),i=await D(e.text,o);if(t||(n.push({role:"user",content:e.text||"",cosplay:a.ROLE||""}),n.push({role:"assistant",content:i,cosplay:a.ROLE||""}),await p.put(r,JSON.stringify(n)).catch(console.error)),i.match(/apiCall:"[^"]+"/)){let h=JSON.parse(i.match(/apiCall:"([^"]+)"/)[1]),c={method:"POST",headers:{"User-Agent":g.USER_AGENT,"Content-Type":"application/json"},body:JSON.stringify(h)};fetch(h.apiCall,c).then(_=>(console.log("statusCode:",_.status),f(`statusCode: ${_.status}`))).then(_=>(console.log("body:",_),f(`statusCode: ${response.status}
body: ${JSON.stringify(_)}`))).catch(_=>(console.error("An error occurred:",_),f("Error calling pipeline")))}return f(i)}catch{return f("A problem when processing your request. Try to wait a bit and ask again")}}async function Kt(e){let t={private:[W,Bt,V,J],group:[_t,W,V,J],supergroup:[_t,W,V,J]};if(!Object.hasOwn(t,a.chatType))return f(`This type is not supported at the moment (${a.chatType}) the chat`);let r=t[a.chatType];for(let o of r)try{let n=await o(e);if(n&&n instanceof Response)return n}catch(n){return d("error",n),f(`Deal with (${a.chatType}) the chat message went wrong`)}return null}async function jt(e){let t=await e.json();if(s.DEV_MODE&&setTimeout(()=>{p.put(`log:${new Date().toISOString()}`,JSON.stringify(t),{expirationTtl:600}).catch(console.error)}),t.edited_message&&(t.message=t.edited_message,a.editChat=!0),t.message)return t.message;throw new Error("Invalid message")}async function vt(e){let t={role:"system",content:N.SYSTEM_INIT_MESSAGE};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH<=0)return{real:[t],original:[t]};let o=[];try{o=JSON.parse(await p.get(e))}catch(c){d("error",c)}(!o||!Array.isArray(o))&&(o=[]);let n=JSON.parse(JSON.stringify(o));a.ROLE&&(o=o.filter(c=>a.ROLE===c.cosplay)),o.forEach(c=>{delete c.cosplay});let i=await dt(),h=(c,_,P,G)=>{c.length>P&&(c=c.splice(c.length-P));let x=_;for(let C=c.length-1;C>=0;C--){let L=c[C],$=0;if(L.content?$=i(L.content):L.content="",x+=$,x>G){c=c.splice(C+1);break}}return c};if(s.AUTO_TRIM_HISTORY&&s.MAX_HISTORY_LENGTH>0){let c=i(t.content),_=Math.max(Object.keys(I.ROLE).length,1);o=h(o,c,s.MAX_HISTORY_LENGTH,s.MAX_TOKEN_LENGTH),n=h(n,c,s.MAX_HISTORY_LENGTH*_,s.MAX_TOKEN_LENGTH*_)}switch(o.length>0?o[0].role:""){case"assistant":case"system":o[0]=t;break;default:o.unshift(t)}return s.SYSTEM_INIT_MESSAGE_ROLE!=="system"&&o.length>0&&o[0].role==="system"&&(o[0].role=s.SYSTEM_INIT_MESSAGE_ROLE),{real:o,original:n}}async function Tt(e){Q(e);let t=await jt(e),r=[Pt,Gt,xt,Dt,Ht,Kt,Ut];for(let o of r)try{let n=await o(t);if(n&&n instanceof Response)return n}catch(n){return d("error",n),new Response(S(n),{status:500})}return null}var B=`
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
`;function F(e){return`<p style="color: red">Please set the <strong>${e}</strong> environment variable in Cloudflare Workers.</p> `}async function Yt(e){let t=[],r=new URL(e.url).host;for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let i=`https://${r}/telegram/${n.trim()}/webhook`,h=n.split(":")[0];t[h]={webhook:await ot(n,i).catch(c=>S(c)),command:await pt(n).catch(c=>S(c))}}let o=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${r}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?F("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(n=>`
        <br/>
        <h4>Bot ID: ${n}</h4>
        <p style="color: ${t[n].webhook.ok?"green":"red"}">Webhook: ${JSON.stringify(t[n].webhook)}</p>
        <p style="color: ${t[n].command.ok?"green":"red"}">Command: ${JSON.stringify(t[n].command)}</p>
        `).join("")}
      ${B}
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Wt(e){let t=[],r=new URL(e.url).host;for(let n of s.TELEGRAM_AVAILABLE_TOKENS){let i=n.split(":")[0];t[i]=await nt(n).catch(h=>S(h))}let o=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${r}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length===0?F("TELEGRAM_AVAILABLE_TOKENS"):""}
    ${Object.keys(t).map(n=>`
        <br/>
        <h4>Bot ID: ${n}</h4>
        ${t[n].ok?'<p style="color:green">Bot successfully deactivated.</p>':'<p style="color:red">Something went wrong. Try again or contact support.</p>'}
        `).join("")}
      ${B}
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function Vt(e){let t=await mt(),{pathname:r}=new URL(e.url),o=r.match(/^\/telegram\/(.+)\/history/)[1];if(new URL(e.url).searchParams.get("password")!==t)return new Response("Password Error",{status:401});let h=JSON.parse(await p.get(o)),c=R(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${h.map(_=>`
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${_.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${_.content}</p>
                </div>
            `).join("")}
        </div>
  `);return new Response(c,{status:200,headers:{"Content-Type":"text/html"}})}async function Jt(e){return await Tt(e)||new Response("NOT HANDLED",{status:200})}async function Ft(){let e=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p>Version (ts:${s.BUILD_TIMESTAMP},sha:${s.BUILD_VERSION})</p>
    <br/>
    <p>You must <strong><a href="./init"> >>>>> click here <<<<< </a></strong> to activate your bot (to bind the webhook).</p>
    <br/>
    ${s.API_KEY?"":F("API_KEY")}
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${ht().map(t=>`<p><strong>${t.command}</strong> - ${t.description}</p>`).join("")}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    <p>Deactivate the bot by pressing <a href="./deactivate"> >> stop my bot << </a> </p>
    ${B}
  `);return new Response(e,{status:200,headers:{"Content-Type":"text/html"}})}async function Xt(e){let t=new URL(e.url).searchParams.get("text")||"Hello World",r=await H(),o=R(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Token Counter:</p>
    <p>source text: ${t}</p>  
    <p>token count: ${r(t)}</p>
    <br/>
    `);return new Response(o,{status:200,headers:{"Content-Type":"text/html"}})}async function zt(){let e=[];for(let r of s.TELEGRAM_AVAILABLE_TOKENS){let o=r.split(":")[0];e[o]=await at(r)}let t=R(`
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
  `);return new Response(t,{status:200,headers:{"Content-Type":"text/html"}})}async function Et(e){let{pathname:t}=new URL(e.url);if(t==="/")return Ft();if(t.startsWith("/init"))return Yt(e);if(t.startsWith("/deactivate"))return Wt(e);if(t.startsWith("/gpt3/tokens/test"))return Xt(e);if(t.startsWith("/telegram")&&t.endsWith("/history"))return Vt(e);if(t.startsWith("/telegram")&&t.endsWith("/webhook"))try{let r=await Jt(e);return r.status===200?r:new Response(r.body,{status:200,headers:{"Original-Status":r.status,...r.headers}})}catch(r){return d("error",r),new Response(S(r),{status:500})}return t.startsWith("/telegram")&&t.endsWith("/bot")?zt(e):null}var ze={async fetch(e,t){try{return Z(t),await Et(e)||new Response("NOT_FOUND",{status:404})}catch(r){return d("error",r),new Response(S(r),{status:500})}}};export{ze as default};

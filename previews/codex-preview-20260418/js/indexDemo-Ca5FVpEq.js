var T=(c,a,l)=>new Promise((d,i)=>{var g=n=>{try{f(l.next(n))}catch(b){i(b)}},h=n=>{try{f(l.throw(n))}catch(b){i(b)}},f=n=>n.done?d(n.value):Promise.resolve(n.value).then(g,h);f((l=l.apply(c,a)).next())});import{m as H,p as Q,a as Y}from"./exports-Bm4nKkRq.js";import{g as Z,S as ee,C as te,e as ae}from"./api-C-icRAP7.js";import{E as ne,as as A,aW as se,aE as le,B as D,a9 as oe,aw as re,C as ie,V as ue,c as de,af as ce,_ as ve}from"./bootstrap-Cw6FCyBr.js";import{R as N}from"./RobotOutlined-2Wv9oQWb.js";import{C as me}from"./ClearOutlined-NyFEXzdB.js";import{U as fe}from"./UserOutlined-DLqpAZ1u.js";import{s as r,d as pe,e as m,H as ye,j as v,o,q as p,w as y,a as k,u as s,c as _,v as E,F as O,k as ke,A as P,t as U,x as ge}from"../jse/index-index-CpQORXl3.js";var he={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"defs",attrs:{},children:[{tag:"style",attrs:{}}]},{tag:"path",attrs:{d:"M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z"}}]},name:"send",theme:"outlined"};function F(c){for(var a=1;a<arguments.length;a++){var l=arguments[a]!=null?Object(arguments[a]):{},d=Object.keys(l);typeof Object.getOwnPropertySymbols=="function"&&(d=d.concat(Object.getOwnPropertySymbols(l).filter(function(i){return Object.getOwnPropertyDescriptor(l,i).enumerable}))),d.forEach(function(i){be(c,i,l[i])})}return c}function be(c,a,l){return a in c?Object.defineProperty(c,a,{value:l,enumerable:!0,configurable:!0,writable:!0}):c[a]=l,c}var $=function(a,l){var d=F({},a,l.attrs);return r(ne,F({},d,{icon:he}),null)};$.displayName="SendOutlined";$.inheritAttrs=!1;const Se={class:"chat-container"},we={class:"chat-header"},Te={class:"header-actions"},_e={class:"mode-switch"},Oe={key:0,class:"empty-state"},xe={key:0,class:"thinking-block"},Ce={class:"thinking-content"},Me={key:0,class:"thinking-block"},Ae={class:"thinking-content"},Ee={class:"input-area"},Ie=`## markstream-vue 渲染测试

这是一个**流式渲染**的 Markdown 内容测试。

### 特性展示

1. **代码高亮** - 支持多种语言
2. **表格渲染** - 结构化数据展示
3. **列表支持** - 有序和无序列表

\`\`\`typescript
// TypeScript 代码示例
interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

### 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| 流式渲染 | ✅ | 逐字符输出 |
| 代码高亮 | ✅ | Shiki/Prism |
| 数学公式 | ✅ | KaTeX 支持 |

> 💡 **提示**: markstream-vue 专为 AI 流式输出设计，能够平滑渲染不完整的 Markdown 文本。

行内代码测试: \`const x = 1;\`


\`\`\`mermaid
graph TD
  A-->B
\`\`\`
---

渲染完成！🎉
`,Le=pe({__name:"indexDemo",setup(c){Q("ai-chat",{code_block:Y});const a=m([]),l=m(null),d=m(""),i=m(!1),g=m([]),h=m(void 0),f=m(!0);let n=null;const b=m(null),S=m(""),x=m("");ye(()=>T(null,null,function*(){yield J()}));function J(){return T(this,null,function*(){var u;try{g.value=yield Z(),g.value.length>0&&!h.value&&(h.value=(u=g.value[0])==null?void 0:u.id)}catch(e){console.error("加载模型列表失败，将使用模拟模式"),f.value=!1}})}function K(){return T(this,null,function*(){const u=Ie.split("");for(const e of u){if(!i.value)break;yield new Promise(t=>setTimeout(t,15)),S.value+=e,C()}})}function q(u){return T(this,null,function*(){return new Promise(e=>{const M=ce().accessToken,L="https://cloud.battcn.com/api",G={chatType:te.NORMAL,modelId:h.value,prompt:u,returnThinking:!0,conversationId:"2002228403977297921"};n=new ee(`${L}${ae()}`,{headers:{Authorization:`Bearer ${M}`,"Content-Type":"application/json"},payload:JSON.stringify(G),method:"POST"}),n.addEventListener("message",z=>{const B=z.data;if(!B)return;const R=w=>w.replaceAll(String.raw`\n`,`
`);try{const w=JSON.parse(B);w.thinking&&(x.value+=R(w.thinking)),w.content&&(S.value+=R(w.content),C())}catch(w){S.value+=R(B),C()}}),n.addEventListener("error",()=>{n==null||n.close(),n=null,e()}),n.addEventListener("readystatechange",z=>{z.readyState===2&&(n=null,e())}),n.stream()})})}function j(){return T(this,null,function*(){const u=d.value.trim();if(!u||i.value)return;a.value.push({id:`user-${Date.now()}`,role:"user",content:u}),d.value="",C();const e=`ai-${Date.now()}`;b.value=e,S.value="",x.value="";const t={id:e,role:"assistant",content:"",thinking:"",loading:!0};a.value.push(t);const M=a.value.length-1;C(),i.value=!0;try{yield f.value?q(u):K()}catch(L){console.error("流式响应错误:",L),de.error("请求失败，请重试")}a.value[M].content=S.value,a.value[M].thinking=x.value,a.value[M].loading=!1,b.value=null,i.value=!1})}function W(){a.value=[],V()}function V(){i.value=!1,n&&(n.close(),n=null)}let I=null;function C(){I||(I=setTimeout(()=>{I=null,ge(()=>{l.value&&(l.value.scrollTop=l.value.scrollHeight)})},100))}function X(u){u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),j())}return(u,e)=>(o(),v("div",Se,[p("header",we,[r(s(A).Title,{level:4,style:{margin:"0"}},{default:y(()=>[r(s(N)),e[3]||(e[3]=k(" AI 对话 + markstream-vue ",-1))]),_:1}),p("div",Te,[p("div",_e,[r(s(A).Text,{type:"secondary"},{default:y(()=>[...e[4]||(e[4]=[k("模拟",-1)])]),_:1}),r(s(se),{checked:f.value,"onUpdate:checked":e[0]||(e[0]=t=>f.value=t),size:"small"},null,8,["checked"]),r(s(A).Text,{type:"secondary"},{default:y(()=>[...e[5]||(e[5]=[k("SSE",-1)])]),_:1})]),f.value&&g.value.length>0?(o(),_(s(le),{key:0,value:h.value,"onUpdate:value":e[1]||(e[1]=t=>h.value=t),options:g.value.map(t=>({label:t.modelName,value:t.id})),placeholder:"选择模型",style:{width:"180px"},size:"small"},null,8,["value","options"])):E("",!0),r(s(D),{size:"small",onClick:W,disabled:a.value.length===0},{default:y(()=>[r(s(me)),e[6]||(e[6]=k(" 清空 ",-1))]),_:1},8,["disabled"])])]),p("div",{ref_key:"messageListRef",ref:l,class:"message-list"},[a.value.length===0?(o(),v("div",Oe,[r(s(N),{class:"empty-icon"}),r(s(A).Text,{type:"secondary"},{default:y(()=>[...e[7]||(e[7]=[k(" 发送任意消息测试 markstream-vue 流式渲染 ",-1)])]),_:1})])):E("",!0),(o(!0),v(O,null,ke(a.value,t=>(o(),v("div",{key:t.id,class:P(["message-item",t.role])},[r(s(oe),{size:36,class:P(["message-avatar",t.role])},{icon:y(()=>[t.role==="user"?(o(),_(s(fe),{key:0})):(o(),_(s(N),{key:1}))]),_:2},1032,["class"]),r(s(ie),{class:P(["message-bubble",t.role]),bordered:!1},{default:y(()=>[t.role==="user"?(o(),v(O,{key:0},[k(U(t.content),1)],64)):(o(),v(O,{key:1},[t.id===b.value?(o(),v(O,{key:0},[S.value?(o(),v(O,{key:1},[x.value?(o(),v("details",xe,[e[8]||(e[8]=p("summary",null,"💭 思考过程",-1)),p("div",Ce,U(x.value),1)])):E("",!0),r(s(H),{"custom-id":"ai-chat",content:S.value},null,8,["content"])],64)):(o(),_(s(re),{key:0,size:"small"}))],64)):(o(),v(O,{key:1},[t.thinking?(o(),v("details",Me,[e[9]||(e[9]=p("summary",null,"💭 思考过程",-1)),p("div",Ae,U(t.thinking),1)])):E("",!0),r(s(H),{"custom-id":"ai-chat",content:t.content},null,8,["content"])],64))],64))]),_:2},1032,["class"])],2))),128))],512),p("div",Ee,[r(s(ue).TextArea,{value:d.value,"onUpdate:value":e[2]||(e[2]=t=>d.value=t),"auto-size":{minRows:1,maxRows:4},placeholder:"输入消息，按 Enter 发送...",disabled:i.value,onKeydown:X},null,8,["value","disabled"]),i.value?(o(),_(s(D),{key:0,type:"default",danger:"",onClick:V},{default:y(()=>[...e[10]||(e[10]=[k(" 停止 ",-1)])]),_:1})):(o(),_(s(D),{key:1,type:"primary",disabled:!d.value.trim(),onClick:j},{default:y(()=>[r(s($)),e[11]||(e[11]=k(" 发送 ",-1))]),_:1},8,["disabled"]))])]))}}),je=ve(Le,[["__scopeId","data-v-40a4b5f8"]]);export{je as default};

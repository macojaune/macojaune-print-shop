import{f as a,u as s}from"./acTAl3uS.js";const l=e=>{const t=Object.create(null);for(const i in e){const n=e[i];n!==void 0&&(t[i]=n)}return t},g=(e,t)=>(i,n)=>(s(()=>e({...l(i),...n.attrs},n)),()=>{var r,o;return t?(o=(r=n.slots).default)==null?void 0:o.call(r):null}),d={accesskey:String,autocapitalize:String,autofocus:{type:Boolean,default:void 0},class:[String,Object,Array],contenteditable:{type:Boolean,default:void 0},contextmenu:String,dir:String,draggable:{type:Boolean,default:void 0},enterkeyhint:String,exportparts:String,hidden:{type:Boolean,default:void 0},id:String,inputmode:String,is:String,itemid:String,itemprop:String,itemref:String,itemscope:String,itemtype:String,lang:String,nonce:String,part:String,slot:String,spellcheck:{type:Boolean,default:void 0},style:String,tabindex:String,title:String,translate:String},S=a({name:"Meta",inheritAttrs:!1,props:{...d,charset:String,content:String,httpEquiv:String,name:String,body:Boolean,renderPriority:[String,Number]},setup:g(e=>{const t={...e};return t.httpEquiv&&(t["http-equiv"]=t.httpEquiv,delete t.httpEquiv),{meta:[t]}})});export{S as M};

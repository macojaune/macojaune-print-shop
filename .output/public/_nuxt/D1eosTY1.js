import{_ as T}from"./ChoT5QJB.js";import B from"./XIgi3NvZ.js";import{f as C,i as M,j as E,u as N,s as P,o as l,c as b,a as e,b as S,w as $,d as p,t as H,k as s,l as I,m as k}from"./acTAl3uS.js";import{u as R}from"./BDHcVqZw.js";import{q}from"./DipYG4pL.js";import"./DKtO6K8a.js";import"./C-v3KzvZ.js";import"./Dnd51l0P.js";import"./COuvC_4m.js";const A={class:"w-full px-4"},V={class:"mb-4 font-display text-5xl uppercase text-amber-600 lg:mb-3 lg:text-7xl"},D={class:"w-full"},J={key:1,class:"my-4 lg:my-8"},O=e("h3",{class:"font-display text-2xl text-amber-400 mb-3 lg:text-3xl"},[p("Le Petit Moodboard "),e("small",{class:"font-sans text-base font-normal italic text-red-500"},"pour la route")],-1),U=["href"],z=e("div",{class:"mt-8 bg-stone-900/50 p-5"},[e("h3",{class:"font-display my-2 text-2xl text-amber-400 lg:my-3 lg:text-3xl"}," Je veux participer, comment on fait ? "),e("p",{class:"text-xl text-white"},[p(" Très simple, accorde-moi 24 secondes (et demi) pour remplir ce court formulaire et c'est parti ! "),e("span",{class:"text-sm italic text-orange-500"},"(ou klaxonne moi dans la rue)")]),e("iframe",{"data-tally-src":"https://tally.so/embed/n0MpAj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1",loading:"lazy",width:"100%",height:"638",frameborder:"0",marginheight:"0",marginwidth:"0",title:"Participer à un Projet Photo avec Macojaune"})],-1),at=C({__name:"[permalink]",async setup(F){var u,y,h,x,f,_,g;let n,m;const{path:d,params:o}=M(),{data:t}=([n,m]=E(()=>R("get-document",()=>q("/projects").where({permalink:`${o==null?void 0:o.permalink}`}).findOne())),n=await n,m(),n),r=(u=t.value)!=null&&u.title?`${(y=t.value)==null?void 0:y.title} | Projets photo du Macojaune`:"Le site du Macojaune";return N({title:r,meta:[{name:"title",content:r},{name:"description",content:(h=t.value)==null?void 0:h.description},{property:"og:type",content:"website"},{property:"og:url",content:`https://macojaune.com${d}`},{property:"og:title",content:r},{property:"og:description",content:(x=t.value)==null?void 0:x.description},{property:"og:image",content:`https://macojaune.com/${(f=t.value)==null?void 0:f.image}`},{property:"twitter:card",content:"summary_large_image"},{property:"twitter:url",content:`https://macojaune.com${d}`},{property:"twitter:title",content:r+" | Le blog du Macojaune"},{property:"twitter:description",content:(_=t.value)==null?void 0:_.description},{property:"twitter:image",content:`https://macojaune.com/${(g=t.value)==null?void 0:g.image}`}],script:[{type:"application/ld+json",innerHTML:JSON.stringify({"@context":"http://schema.org/","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,item:{"@id":"https://macojaune.com",name:"Homepage"}},{"@type":"ListItem",position:2,item:{"@id":"https://macojaune.com/projets/",name:"Projets"}},{"@type":"ListItem",position:3,item:{"@id":"https://macojaune.com/projets/"+o.permalink,name:o.permalink}}]})},{type:"text/javascript",src:"https://tally.so/widgets/embed.js",async:!0,defer:!0},{type:"text/javascript",innerHTML:`var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`}]}),P(()=>{Tally.loadEmbeds(),function(i){var c=i.getElementsByTagName("SCRIPT")[0],a=i.createElement("SCRIPT");a.type="text/javascript",a.async=!0,a.src="//assets.pinterest.com/js/pinit.js",c.parentNode.insertBefore(a,c)}(document)}),(i,c)=>{var j,v,w;const a=T,L=B;return l(),b("div",A,[e("div",null,[S(a,{to:"/projets",class:"text-amber-400 hover:text-amber-600 text-sm"},{default:$(()=>[p("< Retour aux projets")]),_:1}),e("h1",V,H(((j=s(t))==null?void 0:j.title)??""),1),e("div",D,[s(t)?(l(),I(L,{key:0,class:"text-white lg:max-w-5xl",value:s(t)},null,8,["value"])):k("",!0),(v=s(t))!=null&&v.pinterestUrl?(l(),b("div",J,[O,e("a",{"data-pin-do":"embedBoard","data-pin-scale-height":"240","data-pin-scale-width":"220",href:(w=s(t))==null?void 0:w.pinterestUrl},null,8,U)])):k("",!0)])]),z])}}});export{at as default};
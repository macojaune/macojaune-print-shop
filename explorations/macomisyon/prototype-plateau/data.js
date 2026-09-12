export const projects = {
 q: {name:'QuiLivreOù', tagline:'Les bonnes boutiques, jusqu’à chez nous.', description:'Un annuaire pour trouver les sites qui livrent vers les Antilles et la Guyane. On y découvre les boutiques et leurs destinations de livraison.', site:'https://quilivreou.marvinl.com', image:'assets/quilivreou-ui.png', video:null, center:[-5.5,0,1.5], color:0x08877c, selected:'inscrits',
 nodes:[
 {id:'intro',title:'Découvrir le projet',short:'Le projet',pos:[-2.2,0,2.4],kind:'intro'},
 {id:'inscrits',title:'10 inscrits',short:'10 inscrits',pos:[-.8,0,-.1],kind:'count',start:7,count:7,goal:10,unit:'inscription',intro:'Réunir les dix premières personnes inscrites sur QuiLivreOù.',effect:'À dix inscriptions, le chemin vers les retours s’ouvre.',action:'Simuler une inscription'},
 {id:'retours',title:'Les premiers retours',short:'Vos retours',pos:[-2.1,0,-2.5],kind:'future',requires:'inscrits',intro:'Comprendre ce qui aide vraiment à trouver une boutique et ce qui manque encore.',effect:'La mission de collecte reste à définir.'},
 {id:'partenaire',title:'Un premier partenaire',short:'Un partenaire',pos:[2.1,0,1],kind:'count',start:0,count:0,goal:1,unit:'partenaire',intro:'Trouver un partenaire qui souhaite soutenir QuiLivreOù.',effect:'Cette piste peut avancer en parallèle des inscriptions.',action:'Simuler un partenaire'}],
 edges:[['intro','inscrits'],['inscrits','retours'],['intro','partenaire']]},
 s:{name:'Shootareas',tagline:'Un lieu. Une idée. Ton prochain shoot.',description:'Des lieux pour préparer tes photos, vidéos et tournages. Les repérages réunissent l’ambiance du spot et les détails pratiques pour préparer ta sortie.',site:'https://shootareas.marvinl.com',image:'assets/shootareas-ui.png',video:null,center:[5.5,.25,-2.2],color:0x376b62,selected:'decouvertes',
 nodes:[
 {id:'intro',title:'Découvrir Shootareas',short:'Le projet',pos:[-2,0,2.3],kind:'intro'},
 {id:'decouvertes',title:'10 découvertes',short:'10 découvertes',pos:[-.8,0,-.15],kind:'count',start:8,count:8,goal:10,unit:'découverte',intro:'Dix curieux découvrent Shootareas avant sa présentation.',effect:'Le seuil ouvre une étape de présentation. La publication reste à préparer.',action:'Simuler une découverte'},
 {id:'presentation',title:'La présentation',short:'Présentation',pos:[-2.2,0,-2.5],kind:'future',requires:'decouvertes',intro:'Présenter Shootareas et donner envie de partir en repérage.',effect:'Le lien apparaîtra ici quand une vidéo aura été ajoutée.'},
 {id:'spots',title:'3 idées de spots',short:'Vos spots',pos:[2.1,0,1.1],kind:'count',start:1,count:1,goal:3,unit:'idée de spot',intro:'Faire émerger trois lieux que vous aimeriez retrouver sur Shootareas.',effect:'Les suggestions peuvent arriver en parallèle des découvertes.',action:'Simuler une idée de spot'}],
 edges:[['intro','decouvertes'],['decouvertes','presentation'],['intro','spots']]}
};
export const nodeById=(key,id)=>projects[key].nodes.find(n=>n.id===id);
export const done=n=>n.kind==='count'&&n.count>=n.goal;
export const accessible=(key,n)=>!n.requires||done(nodeById(key,n.requires));
export function status(key,n){if(n.kind==='intro')return 'Présentation';if(!accessible(key,n))return 'À venir';if(done(n))return 'Objectif atteint';return n.kind==='count'?'En cours':'Étape ouverte';}
export function resetData(){for(const p of Object.values(projects)){p.selected=p.nodes[1].id;for(const n of p.nodes)if(n.kind==='count')n.count=n.start;}}

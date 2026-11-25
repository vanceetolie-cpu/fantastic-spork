"use strict";
const el=(id)=>document.getElementById(id);
const html=(value)=>String(value??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const normalize=(value)=>String(value??"").normalize("NFKC").toLowerCase().replace(/[\s‐‑‒–—−-]/g,"");
const numeric=/^\d+(?:[-‐‑‒–—−]\d*)*$/;
const pageSize=14;
let state;
let rows=[];
let selectedModel="all";
let selectedSection="";
let selectedPart="";
let page=0;
function message(text,error=false){
  el("message").textContent=text;
  el("message").hidden=!text;
  el("message").classList.toggle("error",error);
}
function componentLabel(group){
  if(group.type==="issue")return group.id;
  return (group.id.startsWith("850-")?"成品":group.id.startsWith("110-")?"整机":"PCBA")+" "+group.id;
}
function scope(model,section=""){
  selectedModel=model;selectedSection=section;selectedPart="";page=0;
  el("search").value="";
  drawModels();drawRows();
}
function drawModels(){
  const openFamilies=new Set(Array.from(el("models").querySelectorAll("details[open]"),node=>node.dataset.family));
  const modelButton=book=>'<button type="button" data-model="'+html(book.model)+
    '" aria-current="'+(book.model===selectedModel)+'">'+html(book.title)+
    (book.root?'<small class="mono">'+html(book.root)+'</small>':"")+'</button>';
  const familyNames=[...new Set(state.books.filter(book=>book.kind==="bom").map(book=>book.family))];
  const view=familyNames.map((family,index)=>{
    const books=state.books.filter(book=>book.family===family);
    const open=openFamilies.has(family)||books.some(book=>book.model===selectedModel)||(!el("models").children.length&&index===0);
    return '<details class="family" data-family="'+html(family)+'"'+(open?" open":"")+
      '><summary>'+html(family)+'</summary>'+books.map(modelButton).join("")+'</details>';
  });
  const issue=state.books.find(item=>item.kind==="issue");
  el("models").innerHTML=modelButton({model:"all",title:"全部工程 BOM"})+view.join("")+(issue?modelButton(issue):"");
  const book=state.books.find(item=>item.model===selectedModel);
  el("list-title").textContent=book?.title??"全部工程 BOM";
  el("rev-heading").textContent=book?.kind==="issue"?"机种号":"REV";
  el("component-heading").textContent=book?.kind==="issue"?"发料单":"组件";
  el("sections").innerHTML='<option value="">全部组件</option>'+(book?.groups??[]).map(group=>
    '<option value="'+html(group.id)+'">'+html(componentLabel(group))+'</option>').join("");
  el("sections").value=selectedSection;
  el("sections").hidden=!book;
}

async function refresh(){
  const response=await fetch("./materials.json");
  if(!response.ok)throw new Error("暂时无法读取物料，请刷新重试。");
  state=await response.json();
  rows=state.books.flatMap(book=>book.groups.flatMap(group=>group.rows.map(row=>({
    ...row,uid:book.model+"|"+group.id+"|"+row.key, model:book.model, modelTitle:book.title,
    section:group.id, partKey:normalize(row.part), kind:group.type,
    search:normalize([row.part,row.label,row.desc,row.ref,row.issue_model,group.id,...row.mfr.flatMap(x=>x.slice(0,3))].join(" ")),
  }))));
  el("metrics").innerHTML=[[state.stats.models,"机型 BOM"],[state.stats.parts,"工程料号"]]
    .map(([v,label])=>"<div><dd>"+v+"</dd><dt>"+label+"</dt></div>").join("");
  drawModels();
  drawRows();
}
function drawRows(){
  const terms=el("search").value.normalize("NFKC").trim().split(/\s+/)
    .map(raw=>[normalize(raw),numeric.test(raw)]).filter(([term])=>term);
  const filtered=rows.filter(row=>(selectedModel==="all"?row.kind==="bom":row.model===selectedModel)&&
    (!selectedSection||row.section===selectedSection)&&
    terms.every(([term,isCode])=>isCode?(term.length===10?row.partKey===term:row.partKey.startsWith(term)):row.search.includes(term)));
  const last=Math.max(0,Math.ceil(filtered.length/pageSize)-1);
  page=Math.min(last,page);
  const offset=page*pageSize;
  const visible=filtered.slice(offset,offset+pageSize);
  el("rows").innerHTML=visible.map(row=>'<tr data-row="'+html(row.uid)+'"><td>'+
    (row.photo?'<button type="button" class="tn" data-zoom aria-label="放大 '+html(row.part)+' 的照片"><img src="'+html(row.photo.url)+'" alt=""></button>':'<span class="none">—</span>')+
    '</td><td><button class="part" type="button">'+html(row.part)+'</button>'+
    (row.label?' <span class="row-label">'+html(row.label)+'</span>':"")+'<span class="describe">'+html(row.desc)+'</span></td>'+
    '<td class="mono">'+html(row.kind==="issue"?row.issue_model:row.rev||"—")+'</td><td class="mono row-qty">'+html(row.qty)+'</td><td class="'+(row.kind==="issue"?"":"mono")+'">'+html(row.section)+
    (selectedModel==="all"?'<span class="describe">'+html(row.modelTitle)+'</span>':"")+'</td></tr>').join("")
    ||'<tr><td class="empty muted" colspan="5">没有符合条件的物料。</td></tr>';
  el("page-status").textContent=visible.length?"第 "+(offset+1)+"–"+(offset+visible.length)+" 条，共 "+filtered.length+" 条":"共 0 条";
  el("previous").disabled=page===0;
  el("next").disabled=page>=last;
  showDetail(visible.find(row=>row.uid===selectedPart)??visible[0]);
}

function showDetail(row,scroll=false){
  selectedPart=row?.uid??"";
  for(const element of el("rows").querySelectorAll("[data-row]"))element.classList.toggle("selected",element.dataset.row===selectedPart);
  if(!row){el("detail").innerHTML='<h2>物料详情</h2><p class="muted">请选择物料。</p>';return;}
  const fields=[["用量",row.qty],["要求数量",row.request_qty],["实际数量",row.actual_qty],["机种号",row.issue_model],
    ["REV",row.rev],["层级",row.level],["父件",row.parent],["位号",row.ref],
    ["备注",row.note]];
  el("detail").innerHTML='<h2>物料详情</h2>'+
    (row.photo?'<button type="button" class="photo" id="enlarge" aria-label="放大照片"><img src="'+html(row.photo.url)+'" alt=""></button>'+
      (row.photo.mpn?'<p class="caption">'+html(row.photo.mpn)+'</p>':""):
      '<div class="photo">暂无实物照片</div>')+
    '<p class="mono part-id">'+html(row.part)+'</p>'+(row.label?'<h3>'+html(row.label)+'</h3>':"")+'<p class="describe">'+html(row.desc)+'</p>'+
    '<dl class="kv">'+fields.filter(([,v])=>v!==""&&v!=null).map(([k,v])=>"<dt>"+html(k)+"</dt><dd>"+html(v)+"</dd>").join("")+"</dl>"+
    (row.mfr.length?'<h3>制造商与厂家料号</h3><ul>'+row.mfr.map(([maker,mpn,status,,ref,note])=>
      "<li>"+[maker,mpn,status,ref,note].filter(Boolean).map(html).join(" · ")+"</li>").join("")+"</ul>":"")+
    '<div class="actions">'+
    (numeric.test(row.part)?'<button type="button" id="find-part">查同料号的机型</button>':"")+'</div>';
  el("enlarge")?.addEventListener("click",()=>zoom(row));
  el("find-part")?.addEventListener("click",()=>{
    scope("all");
    el("search").value=row.part;
    drawRows();
  });
  if(scroll&&matchMedia("(max-width:1120px)").matches)el("detail").scrollIntoView({block:"start"});
}

function zoom(row){
  el("image-title").textContent=row.part+" · 实物照片";
  el("large-image").src=row.photo.url;
  el("image-dialog").showModal();
}
el("models").addEventListener("click",event=>{
  const button=event.target.closest("[data-model]");
  if(button)scope(button.dataset.model);
});
el("sections").addEventListener("change",()=>{selectedSection=el("sections").value;page=0;drawRows();});
el("search").addEventListener("input",()=>{page=0;drawRows();});
el("previous").addEventListener("click",()=>{page--;drawRows();});
el("next").addEventListener("click",()=>{page++;drawRows();});
el("rows").addEventListener("click",event=>{
  const tr=event.target.closest("[data-row]");
  if(!tr)return;
  const row=rows.find(item=>item.uid===tr.dataset.row);
  if(event.target.closest("[data-zoom]"))zoom(row);
  else showDetail(row,true);
});
for(const button of document.querySelectorAll("dialog .close")){
  button.addEventListener("click",()=>button.closest("dialog").close());
}

refresh().catch(error=>message(error.message,true));

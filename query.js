"use strict";
const el=(id)=>document.getElementById(id);
const html=(value)=>String(value??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const normalize=(value)=>String(value??"").normalize("NFKC").toLowerCase().replace(/[\s‐‑‒–—−-]/g,"");
const numeric=/^\d+(?:[-‐‑‒–—−]\d*)*$/;
const pageSize=14;
const locales=["zh-CN","en","vi"];
const text={
  brand:["桦力科技","Huali Technology","Công nghệ Huali"],
  title:["桦力 BOM","Huali BOM","BOM Huali"],
  language:["语言","Language","Ngôn ngữ"],
  stats:["目录统计","Catalog totals","Thống kê danh mục"],
  models:["机型","Models","Dòng máy"],
  list:["物料清单","Materials","Danh sách vật tư"],
  modelCount:["机型 BOM","Model BOMs","BOM theo dòng máy"],
  partCount:["工程料号","Engineering part numbers","Mã vật tư kỹ thuật"],
  all:["全部工程 BOM","All engineering BOMs","Tất cả BOM kỹ thuật"],
  personal:["自用物料","Supplementary materials","Vật tư bổ sung"],
  issue:["生产发料单","Production issue list","Phiếu xuất vật tư sản xuất"],
  component:["组件","Assembly","Cụm lắp ráp"],
  components:["全部组件","All assemblies","Tất cả cụm lắp ráp"],
  componentFilter:["筛选组件","Filter by assembly","Lọc theo cụm lắp ráp"],
  finished:["成品","Finished unit","Thành phẩm"],
  system:["整机","System assembly","Cụm máy hoàn chỉnh"],
  modelNumber:["机种号","Model number","Mã dòng máy"],
  searchLabel:["搜索物料","Search materials","Tìm vật tư"],
  search:["搜索料号、名称或厂家料号","Part number, name or manufacturer part no.","Mã vật tư, tên hoặc mã của nhà sản xuất"],
  searchAll:["搜索料号、名称、厂家料号或文件名","Part number, name, manufacturer part no. or filename","Mã vật tư, tên, mã nhà sản xuất hoặc tên tệp"],
  searchPersonal:["搜索文件名或备注","Filename or note","Tên tệp hoặc ghi chú"],
  part:["料号与描述","Part number and description","Mã và mô tả vật tư"],
  file:["文件名与备注","Filename and note","Tên tệp và ghi chú"],
  photo:["照片","Photo","Ảnh"],
  rev:["REV","Rev.","Phiên bản"],
  quantity:["用量","Quantity","Định mức"],
  requested:["要求数量","Requested quantity","Số lượng yêu cầu"],
  actual:["实际数量","Actual quantity","Số lượng thực tế"],
  level:["层级","Level","Cấp BOM"],
  parent:["父件","Parent assembly","Cụm cha"],
  reference:["位号","Ref. designator","Vị trí linh kiện"],
  note:["备注","Note","Ghi chú"],
  previous:["上一页","Previous","Trang trước"],
  next:["下一页","Next","Trang sau"],
  range:["第 {from}–{to} 条，共 {total} 条","{from}–{to} of {total} results","{from}–{to} trên {total} kết quả"],
  zero:["共 0 条","0 results","0 kết quả"],
  empty:["没有符合条件的物料。","No matching materials.","Không tìm thấy vật tư phù hợp."],
  detail:["物料详情","Material details","Chi tiết vật tư"],
  select:["请选择物料。","Select a material.","Chọn một vật tư."],
  realPhoto:["实物照片","Material photo","Ảnh thực tế"],
  noPhoto:["暂无实物照片","No photo available","Chưa có ảnh thực tế"],
  zoom:["放大照片","Enlarge photo","Phóng to ảnh"],
  close:["关闭","Close","Đóng"],
  manufacturers:["制造商与厂家料号","Manufacturers and part numbers","Nhà sản xuất và mã linh kiện"],
  whereUsed:["查同料号的机型","Find models using this part","Xem dòng máy dùng mã này"],
  loadError:["暂时无法读取物料，请刷新重试。","Materials could not load. Refresh to try again.","Chưa thể tải dữ liệu vật tư. Hãy tải lại trang."],
  黑色:["黑色","Black","Đen"],
  白色:["白色","White","Trắng"],
  粉色:["粉色","Pink","Hồng"],
  紫色:["紫色","Purple","Tím"],
  绿色:["绿色","Green","Xanh lá"]
};
const languageKey="huali-bom-language";
let language=locales[0];
try{
  const saved=localStorage.getItem(languageKey);
  if(locales.includes(saved))language=saved;
}catch{}
const t=(key)=>text[key][locales.indexOf(language)];
const vietnameseRemarks={
  "成品装箱":"Đóng thùng thành phẩm",
  "成品机":"Máy thành phẩm",
  "黑色充电器":"Bộ nguồn màu đen",
  "黑色网线":"Cáp mạng màu đen",
  "外箱贴纸":"Tem thùng ngoài",
  "栈板贴纸":"Tem pallet",
  "白色方形贴纸":"Tem vuông màu trắng",
  "外箱":"Thùng carton ngoài",
  "隔板":"Tấm ngăn",
  "卡板":"Tấm chia ngăn",
  "栈板":"Pallet",
  "保护围膜":"Màng quấn bảo vệ",
  "天地盖":"Nắp trên và nắp đáy",
  "上盖黑色":"Nắp trên màu đen",
  "底壳黑色":"Vỏ đáy màu đen",
  "Telo黑色功能按键":"Phím chức năng Telo màu đen",
  "下盖黑色翻页按键":"Nút chuyển trang màu đen ở nắp dưới",
  "Telo黑色硅胶圈":"Vòng silicone Telo màu đen",
  "保护膜贴纸":"Tem dán màng bảo vệ",
  "保护膜":"Màng bảo vệ",
  "喇叭":"Loa",
  "FCC贴纸":"Tem FCC",
  "喇叭插口":"Cổng kết nối loa",
  "电话插口":"Cổng điện thoại",
  "USB插口":"Cổng USB",
  "网线插口":"Cổng mạng",
  "电源插口":"Cổng nguồn",
  "侧面按键":"Nút bên hông",
  "正面按键":"Nút mặt trước",
  "晶振":"Thạch anh dao động",
  "电容":"Tụ điện",
  "电阻":"Điện trở",
  "电感":"Cuộn cảm",
  "共模滤波器":"Bộ lọc nhiễu đồng pha",
  "磁珠":"Hạt ferrite",
  "变压器":"Biến áp",
  "滤波器":"Bộ lọc",
  "晶体管":"Transistor",
  "二极管":"Điốt",
  "发光二极管":"Điốt phát quang (LED)",
  "集成电路":"Mạch tích hợp (IC)",
  "屏蔽框":"Khung chắn nhiễu",
  "P/N贴纸":"Tem mã linh kiện (P/N)",
  "MAC贴纸":"Tem MAC",
  "DECT贴纸":"Tem DECT",
  "PCB板":"Bảng mạch in (PCB)",
  "保险丝":"Cầu chì",
  "成品箱":"Thùng thành phẩm",
  "白色充电器":"Bộ nguồn màu trắng",
  "白色网线":"Cáp mạng màu trắng",
  "上盖白色":"Nắp trên màu trắng",
  "下盖白色":"Nắp dưới màu trắng",
  "Telo白色功能按键":"Phím chức năng Telo màu trắng",
  "Telo白色硅胶圈":"Vòng silicone Telo màu trắng",
  "警示贴纸":"Tem cảnh báo",
  "WiFi 天线":"Ăng-ten Wi-Fi",
  "Telo FCC贴纸":"Tem FCC của Telo",
  "连接器":"Đầu nối",
  "螺丝":"Vít",
  "贴纸":"Tem dán",
  "HANDSET":"Tay nghe",
  "Screws and Anchors assemble into a labeled PE bag":"Đóng vít và tắc kê vào túi PE có dán nhãn",
  "Top Enclosure top right corner":"Góc trên bên phải của vỏ trên",
  "Top Enclosure bottom left corner":"Góc dưới bên trái của vỏ trên",
  "Top Enclosure top left corner":"Góc trên bên trái của vỏ trên",
  "-Qty 6 for bracket assembly -Qty 4 for Cheep PCBA":"6 chiếc cho cụm giá đỡ, 4 chiếc cho PCBA Cheep",
  "-Qty 6 for enclosure assembly - Qty 1 for battery door":"6 chiếc cho cụm vỏ, 1 chiếc cho nắp ngăn pin",
  "For Cello PCBA":"Dùng cho PCBA Cello",
  "Load to J1200 M.2 Key B Connector":"Lắp vào đầu nối J1200 M.2 Key B",
  "1 - to Pisces U.FL Coaxial (J201) 2 - to SunDial U.FL Coaxial ( J1004)":"1 – nối với đầu nối đồng trục U.FL của Pisces (J201); 2 – nối với đầu nối đồng trục U.FL của SunDial (J1004)",
  "6 screws for enclosure and 4 for Cheep":"6 vít cho vỏ, 4 vít cho Cheep",
  "6 screw for battery bracket and 1 for battery blocker":"6 vít cho giá đỡ pin và 1 vít cho chốt chặn pin",
  "Screws Cello and Pisces":"Vít dùng cho Cello và Pisces",
  "SunDial U.FL Coaxial (J1004)":"Đầu nối đồng trục U.FL của SunDial (J1004)",
  "RG255G Diversity MF4 Flex Antenna":"Ăng-ten dẻo MF4 cho nhánh Diversity của RG255G",
  "RG255G Main MF4 to SMA":"Đường chính (Main) của RG255G, từ MF4 đến SMA"
};
function vietnameseRemark(value){
  if(!value)return value;
  const normalized=value.trim().replace(/\s+/g," ");
  if(Object.hasOwn(vietnameseRemarks,normalized))return vietnameseRemarks[normalized];
  const ratio=normalized.match(/^(\d+)\s*(set\s+)?per\s+(\d+)(?:\s+(units?|handsets?|linx))?(?:\s*\(length:\s*([\d.]+)\s*m\s*\))?$/i);
  if(!ratio)return value;
  const [,count,set,total,unit,length]=ratio;
  const unitName=/^handset/i.test(unit)?" tay nghe":/^linx$/i.test(unit)?" thiết bị LINX":unit?" đơn vị":"";
  return count+(set?" bộ":"")+" trên mỗi "+total+unitName+
    (length?" (chiều dài: "+length.replace(".",",")+" m)":"");
}
const displayRemark=(value)=>language==="vi"?vietnameseRemark(value):value;
let state;
let rows=[];
let selectedModel="all";
let selectedSection="";
let selectedPart="";
let page=0;
let loadFailed=false;
function drawLanguage(){
  document.documentElement.lang=language;
  document.title=t("title");
  el("language").value=language;
  for(const node of document.querySelectorAll("[data-text]"))node.textContent=t(node.dataset.text);
  for(const node of document.querySelectorAll("[data-label]"))node.setAttribute("aria-label",t(node.dataset.label));
  for(const node of document.querySelectorAll("[data-alt]"))node.alt=t(node.dataset.alt);
  if(loadFailed)message(t("loadError"),true);
}
function modelTitle(book){
  if(book.kind==="issue")return t("issue");
  return book.title.replace(/ (黑色|白色|粉色|紫色|绿色)$/,(_,color)=>" "+t(color));
}
function message(text,error=false){
  el("message").textContent=text;
  el("message").hidden=!text;
  el("message").classList.toggle("error",error);
}
function componentLabel(group){
  if(group.type==="issue")return group.id;
  return (group.id.startsWith("850-")?t("finished"):group.id.startsWith("110-")?t("system"):"PCBA")+" "+group.id;
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
      '><summary>'+html(family)+'</summary>'+books.map(book=>modelButton({...book,title:modelTitle(book)})).join("")+'</details>';
  });
  const issue=state.books.find(item=>item.kind==="issue");
  const personal={model:"personal",title:t("personal")};
  el("models").innerHTML=modelButton({model:"all",title:t("all")})+
    (state.personal?.length?modelButton(personal):"")+view.join("")+(issue?modelButton({...issue,title:modelTitle(issue)}):"");
  const book=state.books.find(item=>item.model===selectedModel);
  const personalView=selectedModel===personal.model;
  el("list-title").textContent=personalView?personal.title:book?modelTitle(book):t("all");
  el("search").placeholder=t(personalView?"searchPersonal":selectedModel==="all"?"searchAll":"search");
  el("rev-heading").textContent=t(book?.kind==="issue"?"modelNumber":"rev");
  el("component-heading").textContent=t(book?.kind==="issue"?"issue":"component");
  el("sections").innerHTML='<option value="">'+html(t("components"))+'</option>'+(book?.groups??[]).map(group=>
    '<option value="'+html(group.id)+'">'+html(componentLabel(group))+'</option>').join("");
  el("sections").value=selectedSection;
  el("sections").hidden=!book;
}

function drawCatalog(){
  el("metrics").innerHTML=[[state.stats.models,t("modelCount")],[state.stats.parts,t("partCount")]]
    .map(([v,label])=>"<div><dd>"+html(v)+"</dd><dt>"+html(label)+"</dt></div>").join("");
  drawModels();
  drawRows();
}

async function refresh(){
  const response=await fetch("./materials.json",{cache:"no-cache"});
  if(!response.ok)throw new Error(t("loadError"));
  state=await response.json();
  rows=state.books.flatMap(book=>book.groups.flatMap(group=>group.rows.map(row=>({
    ...row,uid:book.model+"|"+group.id+"|"+row.key, model:book.model, modelTitle:book.title,
    section:group.id, partKey:normalize(row.part), kind:group.type,
    search:normalize([row.part,row.label,vietnameseRemark(row.label),row.note,vietnameseRemark(row.note),row.desc,
      row.ref,row.issue_model,group.id,...row.mfr.flatMap(x=>x.slice(0,3))].join(" ")),
  }))));
  rows.push(...(state.personal??[]).map(item=>({
    uid:"personal|"+item.name,model:"personal",kind:"personal",part:item.name,label:item.label,partKey:normalize(item.name),
    search:normalize([item.name,item.label,vietnameseRemark(item.label)].join(" ")),photo:{url:item.url}
  })));
  drawCatalog();
}
function drawRows(){
  const terms=el("search").value.normalize("NFKC").trim().split(/\s+/)
    .map(raw=>[normalize(raw),numeric.test(raw)]).filter(([term])=>term);
  const includePersonal=selectedModel==="all"&&terms.length>0;
  const filtered=rows.filter(row=>(selectedModel==="all"?
    row.kind==="bom"||(includePersonal&&row.kind==="personal"):row.model===selectedModel)&&
    (!selectedSection||row.section===selectedSection)&&
    terms.every(([term,isCode])=>isCode?(row.kind!=="personal"&&term.length===10?row.partKey===term:row.partKey.startsWith(term)):row.search.includes(term)));
  const personalColumns=selectedModel==="personal"||
    (filtered.length>0&&filtered.every(row=>row.kind==="personal"));
  el("part-heading").textContent=t(personalColumns?"file":"part");
  for(const id of ["rev-heading","qty-heading","component-heading"])el(id).hidden=personalColumns;
  el("rows").closest("table").classList.toggle("personal-list",personalColumns);
  const last=Math.max(0,Math.ceil(filtered.length/pageSize)-1);
  page=Math.min(last,page);
  const offset=page*pageSize;
  const visible=filtered.slice(offset,offset+pageSize);
  el("rows").innerHTML=visible.map(row=>'<tr data-row="'+html(row.uid)+'"><td>'+
    (row.photo?'<button type="button" class="tn" data-zoom aria-label="'+html(t("zoom")+' · '+row.part)+'"><img src="'+html(row.photo.url)+'" alt=""></button>':'<span class="none">—</span>')+
    '</td><td'+(row.kind==="personal"&&!personalColumns?' colspan="4"':"")+'><button class="part" type="button">'+html(row.part)+'</button>'+
    (row.kind==="personal"?(row.label?'<span class="describe">'+html(displayRemark(row.label))+'</span>':"")+'</td>':
    (row.label?' <span class="row-label">'+html(displayRemark(row.label))+'</span>':"")+'<span class="describe">'+html(row.desc)+'</span></td>'+
    '<td class="mono">'+html(row.kind==="issue"?row.issue_model:row.rev||"—")+'</td><td class="mono row-qty">'+html(row.qty)+'</td><td class="'+(row.kind==="issue"?"":"mono")+'">'+html(row.section)+
    (selectedModel==="all"?'<span class="describe">'+html(modelTitle({kind:row.kind,title:row.modelTitle}))+'</span>':"")+'</td>')+'</tr>').join("")
    ||'<tr><td class="empty muted" colspan="'+(personalColumns?2:5)+'">'+html(t("empty"))+'</td></tr>';
  el("page-status").textContent=visible.length?t("range").replace("{from}",offset+1)
    .replace("{to}",offset+visible.length).replace("{total}",filtered.length):t("zero");
  el("previous").disabled=page===0;
  el("next").disabled=page>=last;
  showDetail(visible.find(row=>row.uid===selectedPart)??visible[0]);
}

function showDetail(row,scroll=false){
  selectedPart=row?.uid??"";
  for(const element of el("rows").querySelectorAll("[data-row]"))element.classList.toggle("selected",element.dataset.row===selectedPart);
  const heading='<h2>'+html(t("detail"))+'</h2>';
  if(!row){el("detail").innerHTML=heading+'<p class="muted">'+html(t("select"))+'</p>';return;}
  const photoButton=row.photo?'<button type="button" class="photo" id="enlarge" aria-label="'+html(t("zoom"))+
    '"><img src="'+html(row.photo.url)+'" alt=""></button>':'<div class="photo">'+html(t("noPhoto"))+'</div>';
  const name='<p class="mono part-id">'+html(row.part)+'</p>'+(row.label?'<h3>'+html(displayRemark(row.label))+'</h3>':"");
  if(row.kind==="personal"){
    el("detail").innerHTML=heading+photoButton+name;
    el("enlarge").addEventListener("click",()=>zoom(row));
    if(scroll&&matchMedia("(max-width:1120px)").matches)el("detail").scrollIntoView({block:"start"});
    return;
  }
  const fields=[["quantity",row.qty],["requested",row.request_qty],["actual",row.actual_qty],["modelNumber",row.issue_model],
    ["rev",row.rev],["level",row.level],["parent",row.parent],["reference",row.ref],["note",displayRemark(row.note)]];
  el("detail").innerHTML=heading+photoButton+
    (row.photo?.mpn?'<p class="caption">'+html(row.photo.mpn)+'</p>':"")+
    name+'<p class="describe">'+html(row.desc)+'</p>'+
    '<dl class="kv">'+fields.filter(([,v])=>v!==""&&v!=null).map(([k,v])=>"<dt>"+html(t(k))+"</dt><dd>"+html(v)+"</dd>").join("")+"</dl>"+
    (row.mfr.length?'<h3>'+html(t("manufacturers"))+'</h3><ul>'+row.mfr.map(([maker,mpn,status,,ref,note])=>
      "<li>"+[maker,mpn,status,ref,displayRemark(note)].filter(Boolean).map(html).join(" · ")+"</li>").join("")+"</ul>":"")+
    '<div class="actions">'+
    (numeric.test(row.part)?'<button type="button" id="find-part">'+html(t("whereUsed"))+'</button>':"")+'</div>';
  el("enlarge")?.addEventListener("click",()=>zoom(row));
  el("find-part")?.addEventListener("click",()=>{
    scope("all");
    el("search").value=row.part;
    drawRows();
  });
  if(scroll&&matchMedia("(max-width:1120px)").matches)el("detail").scrollIntoView({block:"start"});
}

function zoom(row){
  el("image-title").textContent=row.part+" · "+t("realPhoto");
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
el("language").addEventListener("change",event=>{
  if(!locales.includes(event.target.value))return;
  language=event.target.value;
  try{localStorage.setItem(languageKey,language);}catch{}
  drawLanguage();
  if(state)drawCatalog();
});
drawLanguage();
refresh().catch(()=>{
  loadFailed=true;
  message(t("loadError"),true);
});

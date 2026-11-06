const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const pageNames = {overview:"Overview",communications:"Communications",reports:"Reports",workforce:"Workforce",equipment:"Equipment",safety:"Safety",approvals:"Approvals",shifts:"Shifts & handover",map:"Plant map",history:"History & audit"};
function showToast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function go(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#pageCrumb").textContent=pageNames[page]||"Overview";setSidebarOpen(false);window.scrollTo(0,0)}
$("#mainNav").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)go(b.dataset.page)});
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
const sidebar=$("#sidebar"),sidebarBackdrop=$("#sidebarBackdrop"),mobileMenu=$("#mobileMenu");
function setSidebarOpen(open){
  sidebar.classList.toggle("open",open);
  sidebarBackdrop.classList.toggle("visible",open);
  document.body.classList.toggle("sidebar-open",open);
  mobileMenu.setAttribute("aria-expanded",String(open));
  mobileMenu.setAttribute("aria-label",open?"Close navigation":"Open navigation");
}
mobileMenu.setAttribute("aria-controls","sidebar");
mobileMenu.setAttribute("aria-expanded","false");
mobileMenu.addEventListener("click",()=>setSidebarOpen(!sidebar.classList.contains("open")));
sidebarBackdrop.addEventListener("click",()=>setSidebarOpen(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&sidebar.classList.contains("open"))setSidebarOpen(false)});
window.addEventListener("resize",()=>{if(window.innerWidth>850)setSidebarOpen(false)});
$("#profileMenu").addEventListener("click",()=>showToast("Profile and role switching are simulated in this prototype."));
const chatData={
 announcements:{title:"Plant announcements",sub:"Official · Plant-wide · 52 members",avatar:"↗",cls:"purple-bg",pin:"All shift supervisors must submit area readiness before 01:30 PM.",messages:[["VK","Vik Kumar","Plant Manager","09:05 AM","Good morning team. Please ensure all area inspections and equipment status reports are submitted before shift handover.",""],["AS","Anil Sahu","Supervisor","09:22 AM","Crusher House Floor 1 inspection completed. No new observations.","Area inspection report"]]},
 crusher:{title:"Crusher House",sub:"Official area channel · 18 members",avatar:"CR",cls:"green-bg",pin:"Report equipment stoppages immediately. Do not mark area operational while a critical event is unresolved.",messages:[["AS","Anil Sahu","Supervisor","09:22 AM","Floor 1 inspection completed. No new observations.","Area inspection report"],["RK","Rakesh Kumar","Operator","10:31 AM","Crusher 02 stopped at 10:25 due to abnormal vibration. Maintenance team informed.","Equipment event · EQ-204"]]},
 conveyor:{title:"Conveyor Gallery",sub:"Official area channel · 12 members",avatar:"CV",cls:"blue-bg",pin:"PPE inspection is required before work at elevated access points.",messages:[["PM","Priya Mohanty","Safety officer","09:48 AM","PPE observation submitted for Floor 2. Follow-up assigned to area supervisor.","Safety observation"]]},
 electrical:{title:"Electrical Room",sub:"Official area channel · 6 members",avatar:"EL",cls:"amber-bg",pin:"Electrical isolation and permit checks must be recorded before maintenance.",messages:[["MD","Manoj Das","Operator","09:15 AM","DB-04 inspection is in progress. Awaiting supervisor verification.","Equipment check"]]},
 "shift-a":{title:"Shift A · Operations",sub:"Official shift channel · 26 members",avatar:"A",cls:"slate-bg",pin:"Shift A closure and handover due at 01:30 PM.",messages:[["AS","Anil Sahu","Supervisor","08:55 AM","Shift A opening checklist completed. Attendance verified.","Shift opening"]]},
 "shift-b":{title:"Shift B · Handover",sub:"Official shift channel · 24 members",avatar:"B",cls:"slate-bg",pin:"Incoming shift: review all carried-forward maintenance items.",messages:[["VK","Vik Kumar","Plant Manager","Yesterday","Please review the open handover items before shift commencement.","Handover note"]]}
};
function renderChat(key){const d=chatData[key];if(!d)return;$("#chatTitle").textContent=d.title;$("#chatSubtitle").textContent=d.sub;$("#chatAvatar").textContent=d.avatar;$("#chatAvatar").className=`channel-avatar ${d.cls}`;$("#pinnedText").textContent=d.pin;const stream=$("#chatStream");stream.innerHTML='<div class="date-divider"><span>TODAY · 06 NOVEMBER</span></div>';d.messages.forEach(m=>appendMessage(m,stream));$$(".channel-item").forEach(b=>b.classList.toggle("selected",b.dataset.chat===key));}
function appendMessage(m,stream=$("#chatStream")){const row=document.createElement("div");row.className="message-row";const av=document.createElement("div");av.className="avatar avatar-small "+(m[0]==="RK"?"orange-avatar":m[0]==="VK"?"purple-avatar":m[0]==="PM"?"purple-avatar":"blue-avatar");av.textContent=m[0];const content=document.createElement("div");content.className="message-content";const meta=document.createElement("div");meta.className="message-meta";const who=document.createElement("b");who.textContent=m[1];const role=document.createElement("i");role.textContent=m[2];who.append(role);const time=document.createElement("time");time.textContent=m[3];meta.append(who,time);const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=m[4];content.append(meta,bubble);if(m[5]){const chip=document.createElement("div");chip.className="report-chip";chip.innerHTML='<span class="chip-icon">▤</span><span><b></b><small>Created in prototype</small></span><span class="chip-state">Submitted</span>';chip.querySelector("b").textContent=m[5];content.append(chip)}row.append(av,content);stream.append(row);stream.scrollTop=stream.scrollHeight;}
$$(".channel-item").forEach(b=>b.addEventListener("click",()=>renderChat(b.dataset.chat)));
$("#channelSearch").addEventListener("input",e=>$$(".channel-item").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(e.target.value.toLowerCase())?"flex":"none"));
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput"),v=input.value.trim();if(!v)return;appendMessage(["VK","Vik Kumar","Plant Manager",new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),v,""]);input.value="";showToast("Demo message added to this channel.");});
$$("[data-quick]").forEach(b=>b.addEventListener("click",()=>openModal("New "+b.dataset.quick.toLowerCase(),reportForm(b.dataset.quick))));
$("#newMessage").addEventListener("click",()=>openModal("Publish channel update",`<div class="field"><label>CHANNEL</label><select><option>Plant announcements</option><option>Crusher House</option><option>Conveyor Gallery</option><option>Electrical Room</option></select></div><div class="field"><label>MESSAGE</label><textarea placeholder="Write an official operational update..."></textarea></div><div class="field"><label>ACKNOWLEDGEMENT REQUIRED</label><select><option>No</option><option>Yes — require read acknowledgement</option></select></div>`));
function reportForm(type="Operational report"){return `<div class="modal-body-grid"><div class="field"><label>REPORT TYPE</label><select><option>${type}</option><option>Equipment status</option><option>Attendance</option><option>Safety observation</option><option>Work progress</option><option>Area inspection</option></select></div><div class="field"><label>AREA</label><select><option>Crusher House</option><option>Conveyor Gallery</option><option>Electrical Room</option><option>Raw Material Yard</option></select></div></div><div class="modal-body-grid"><div class="field"><label>FLOOR / LOCATION</label><select><option>Floor 1</option><option>Floor 2</option><option>Floor 3</option><option>Ground</option></select></div><div class="field"><label>REPORTING MODE</label><select><option>Guided report</option><option>Immediate event</option><option>Periodic update</option></select></div></div><div class="field"><label>DETAILS / OBSERVATION</label><textarea placeholder="Describe the condition, work completed, or event..."></textarea></div><div class="field"><label>ATTACHMENT</label><input type="file" accept="image/*,.pdf"></div>`}
$("#createReport").addEventListener("click",()=>openModal("Create operational report",reportForm()));
$("#guidedReport").addEventListener("click",()=>openModal("Guided report",reportForm("Guided operational report")));
$("#naturalReport").addEventListener("click",()=>openModal("Natural-language report",`<div class="field"><label>DESCRIBE WHAT HAPPENED</label><textarea id="nlText" placeholder="Example: Crusher 02 stopped at 10:25 due to abnormal vibration. Maintenance team informed."></textarea></div><div class="notice-box"><span>✳</span><div><b>Illustrative extraction preview</b><p>In a connected version, the system will identify equipment, event, time, reason and action, then ask you to confirm before saving.</p></div></div>`));
$("#addEmployee").addEventListener("click",()=>openModal("Add employee",`<div class="modal-body-grid"><div class="field"><label>EMPLOYEE NAME</label><input placeholder="Full name"></div><div class="field"><label>EMPLOYEE ID</label><input placeholder="EMP-0000"></div><div class="field"><label>ROLE</label><select><option>Operator</option><option>Helper</option><option>Supervisor</option><option>Manager</option><option>Safety officer</option></select></div><div class="field"><label>AREA</label><select><option>Crusher House</option><option>Conveyor Gallery</option><option>Electrical Room</option></select></div></div><div class="field"><label>SHIFT</label><select><option>Shift A</option><option>Shift B</option><option>Shift C</option></select></div>`));
$("#equipmentCheck").addEventListener("click",()=>openModal("Record equipment check",`<div class="modal-body-grid"><div class="field"><label>EQUIPMENT</label><select><option>Crusher 01 · EQ-201</option><option>Crusher 02 · EQ-204</option><option>Conveyor CV-04 · EQ-211</option></select></div><div class="field"><label>CONDITION</label><select><option>Running</option><option>Stopped</option><option>Standby</option><option>Maintenance</option></select></div></div><div class="modal-body-grid"><div class="field"><label>TEMPERATURE (°C)</label><input type="number" placeholder="e.g. 62"></div><div class="field"><label>VIBRATION</label><input placeholder="Normal / Elevated"></div></div><div class="field"><label>OBSERVATION</label><textarea placeholder="Enter machine condition or fault..."></textarea></div>`));
$("#safetyReport").addEventListener("click",()=>openModal("New safety observation",reportForm("Safety observation")));
$("#configureShifts").addEventListener("click",()=>openModal("Configure shift templates",`<div class="notice-box"><span>◷</span><div><b>Configurable shifts</b><p>These are illustrative settings. Later, shift templates will be stored in the database and assigned by authorized administrators.</p></div></div><div class="modal-body-grid"><div class="field"><label>SHIFT NAME</label><input value="Shift A"></div><div class="field"><label>STATUS</label><select><option>Enabled</option><option>Disabled</option></select></div><div class="field"><label>START TIME</label><input type="time" value="06:00"></div><div class="field"><label>END TIME</label><input type="time" value="14:00"></div></div>`));
$("#handoverBtn").addEventListener("click",()=>openModal("Shift handover checklist",`<div class="field"><label>OUTGOING SHIFT SUMMARY</label><textarea placeholder="Summarize work completed and pending issues..."></textarea></div><div class="field"><label>OPEN ITEMS TO CARRY FORWARD</label><select><option>Crusher 02 vibration investigation</option><option>DB-04 panel inspection</option><option>Both items</option></select></div><div class="field"><label>INCOMING SHIFT</label><select><option>Shift B</option><option>Shift C</option></select></div>`));
$$("[data-action]").forEach(b=>b.addEventListener("click",()=>{const action=b.dataset.action;showToast(action==="approve"?"Demo decision recorded. Official status is not changed.":action==="reject"?"Demo rejection recorded.":"Clarification request simulated.");b.closest(".approval-card").style.opacity=".58";b.closest(".approval-card").querySelector(".approval-card-top").insertAdjacentHTML("beforeend",'<span class="status-pill status-muted">Action simulated</span>')}));
$("#exportHistory").addEventListener("click",()=>{const csv="Timestamp,Activity,Actor,Reference,Result\n10:31:42 AM,Equipment event submitted,Rakesh Kumar,RPT-0264,Recorded\n10:12:08 AM,Attendance verified,Anil Sahu,ATT-0118,Verified\n09:48:19 AM,Safety observation created,Priya Mohanty,SAFE-0081,Open";const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="plant-tracker-demo-audit.csv";a.click();URL.revokeObjectURL(a.href);showToast("Sample audit CSV exported.")});
let modalMode="";function openModal(title,body){modalMode=title;$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modalBackdrop").classList.add("open")}
function closeModal(){$("#modalBackdrop").classList.remove("open")}
$("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});$("#submitModal").addEventListener("click",()=>{const text=modalMode.toLowerCase().includes("employee")?"Employee added to demo view.":modalMode.toLowerCase().includes("equipment")?"Equipment check recorded in demo.":modalMode.toLowerCase().includes("shift")?"Shift configuration simulated.":"Demonstration entry saved locally in this session.";closeModal();showToast(text)});
$("#newMessage").addEventListener("click",()=>{});$("#mobileMenu").addEventListener("keydown",e=>{if(e.key==="Escape")$("#sidebar").classList.remove("open")});

/* Plant Tracker shared workforce hierarchy prototype store.
   Persisted locally for this browser; production permissions must be enforced server-side. */
(()=>{
 const KEY="plant_tracker_org_hierarchy_v1", AUDIT="plant_tracker_org_audit_v1";
 const levels=[
  ["Site VP",13],["Site Head",12],["Site Manager",11],["Site Incharge",10],
  ["Department Head",9],["Department Incharge",8],["Supervisor",7],
  ["Technician",6],["Operator",5],["Electrician",5],["Rigger",5],["Fitter",5],
  ["Welder / Cutter",5],["Driver",4],["Helper",3],["Cleaner",3],["Peon",2]
 ];
 const defaults=[
  {id:"POS-001",role:"Site VP",dept:"Site Leadership",parent:"",person:"",employeeId:"",status:"Vacant",zoneId:"",drawingId:""},
  {id:"POS-002",role:"Site Head",dept:"Site Leadership",parent:"POS-001",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-003",role:"Site Manager",dept:"Site Leadership",parent:"POS-002",person:"Vik Kumar",employeeId:"EMP-0001",status:"Occupied"},
  {id:"POS-004",role:"Site Incharge",dept:"Operations",parent:"POS-003",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-005",role:"Department Head",dept:"Operations",parent:"POS-004",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-006",role:"Department Incharge",dept:"Operations",parent:"POS-005",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-007",role:"Supervisor",dept:"Operations",parent:"POS-006",person:"Anil Sahu",employeeId:"EMP-0012",status:"Occupied"},
  {id:"POS-008",role:"Operator",dept:"Operations",parent:"POS-007",person:"Rakesh Kumar",employeeId:"EMP-0024",status:"Occupied"},
  {id:"POS-009",role:"Helper",dept:"Operations",parent:"POS-007",person:"Santosh Behera",employeeId:"EMP-0045",status:"Occupied"},
  {id:"POS-010",role:"Cleaner",dept:"Operations",parent:"POS-007",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-011",role:"Technician",dept:"Mechanical",parent:"POS-006",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-012",role:"Fitter",dept:"Mechanical",parent:"POS-011",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-013",role:"Welder / Cutter",dept:"Mechanical",parent:"POS-011",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-014",role:"Electrician",dept:"Electrical",parent:"POS-006",person:"Manoj Das",employeeId:"EMP-0040",status:"Occupied"},
  {id:"POS-015",role:"Rigger",dept:"Mechanical",parent:"POS-006",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-016",role:"Driver",dept:"Logistics",parent:"POS-004",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-017",role:"Peon",dept:"Administration",parent:"POS-003",person:"",employeeId:"",status:"Vacant"},
  {id:"POS-018",role:"Department Incharge",dept:"Safety",parent:"POS-004",person:"Priya Mohanty",employeeId:"EMP-0031",status:"Occupied"}
 ];
 let positions;try{positions=JSON.parse(localStorage.getItem(KEY))||defaults}catch(e){positions=defaults}
 positions=positions.map(p=>({...p,zoneId:p.zoneId||"",drawingId:p.drawingId||""}));
 let audit;try{audit=JSON.parse(localStorage.getItem(AUDIT))||[]}catch(e){audit=[]}
 const MAP_KEY="plant_tracker_map_features_v1", DRAW_KEY="plant_tracker_engineering_annotations_v1";
 function readFeatures(key){try{const v=JSON.parse(localStorage.getItem(key)||"null");if(!v)return[];return key===MAP_KEY?(v.features||[]):v;}catch(e){return[]}}
 function featureLabel(f){return f?.properties?.name||f?.name||"Unnamed zone"}
 function linkOptions(){const m=readFeatures(MAP_KEY),d=readFeatures(DRAW_KEY);return {map:m.map((f,i)=>({id:f.properties?.zoneId||f.properties?.featureId||`MAP-${i+1}`,name:featureLabel(f)})),drawing:d.map((f,i)=>({id:f.zoneId||f.id||`DWG-${i+1}`,name:f.name||"Drawing annotation"}))}}
 function ensureFeatureIds(){let raw;try{raw=JSON.parse(localStorage.getItem(MAP_KEY)||"null")}catch(e){}if(raw?.features){let changed=false;raw.features.forEach((f,i)=>{f.properties=f.properties||{};if(!f.properties.zoneId){f.properties.zoneId=f.properties.featureId||`ZONE-${String(i+1).padStart(3,"0")}`;changed=true;}});if(changed)localStorage.setItem(MAP_KEY,JSON.stringify(raw));}
 let d=readFeatures(DRAW_KEY);let changed=false;d.forEach((f,i)=>{if(!f.id){f.id=`DRAW-${String(i+1).padStart(3,"0")}`;changed=true;}});if(changed)localStorage.setItem(DRAW_KEY,JSON.stringify(d));}
 function updateZoneAssignments(){
  let raw;try{raw=JSON.parse(localStorage.getItem(MAP_KEY)||"null")}catch(e){}
  if(raw?.features){raw.features.forEach(f=>{const zid=f.properties?.zoneId;const linked=positions.filter(p=>p.zoneId===zid);f.properties=f.properties||{};f.properties.assignedPositions=linked.map(p=>({positionId:p.id,role:p.role,employee:p.person||"Vacant",employeeId:p.employeeId||""}));});localStorage.setItem(MAP_KEY,JSON.stringify(raw));}
  window.dispatchEvent(new StorageEvent("storage",{key:MAP_KEY,newValue:localStorage.getItem(MAP_KEY)}));
 }
 const $=s=>document.querySelector(s), rank=r=>(levels.find(x=>x[0]===r)||["",0])[1];
 const acting=$("#actingRole"), rows=$("#orgRows");
 if(!rows)return;
 function save(action,detail){localStorage.setItem(KEY,JSON.stringify(positions));audit.unshift({at:new Date().toISOString(),actor:acting.value,action,detail});audit=audit.slice(0,300);localStorage.setItem(AUDIT,JSON.stringify(audit));window.dispatchEvent(new CustomEvent("planttracker:datachange",{detail:{type:"organization",action,detail}}));}
 function canManage(pos){
   const me=acting.value, myRank=rank(me), targetRank=rank(pos.role);
   if(myRank<=targetRank)return false;
   if(me==="Site VP"||me==="Site Head"||me==="Site Manager")return true;
   if(me==="Site Incharge")return !["Site Leadership"].includes(pos.dept)&&targetRank<myRank;
   if(me==="Department Head"||me==="Department Incharge")return pos.dept===departmentForRole(me)&&targetRank<myRank;
   if(me==="Supervisor")return pos.dept==="Operations"&&targetRank<myRank;
   return false;
 }
 function departmentForRole(){return $("#orgDepartment")?.value!=="all"?$("#orgDepartment")?.value:"Operations"}
 function esc(v){return String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function parentName(id){return positions.find(p=>p.id===id)?.role||"—"}
 function render(){
  updateZoneAssignments();
  const dept=$("#orgDepartment").value, q=$("#orgSearch").value.toLowerCase();
  const list=positions.filter(p=>(dept==="all"||p.dept===dept)&&[p.role,p.person,p.employeeId,p.dept,p.id].join(" ").toLowerCase().includes(q));
  const occupied=positions.filter(p=>p.person).length;
  $("#orgSummary").innerHTML=`<span><b>${positions.length}</b> positions</span><span><b>${occupied}</b> occupied</span><span><b>${positions.length-occupied}</b> vacant</span><span><b>${audit.length}</b> logged changes</span>`;
  const overview=$("#overviewOrgStats");if(overview)overview.innerHTML=`<span><b>${positions.length}</b> authorised positions</span><span><b>${occupied}</b> occupied</span><span><b>${positions.length-occupied}</b> vacant</span><span><b>${new Set(positions.map(p=>p.dept)).size}</b> departments</span>`;
  const feed=$("#orgAuditFeed");if(feed)feed.innerHTML=audit.length?audit.slice(0,12).map(a=>`<div class="activity-item"><div class="activity-icon">↻</div><div><b>${esc(a.action)}</b><p>${esc(a.detail)} · ${esc(a.actor)}</p><small>${new Date(a.at).toLocaleString()}</small></div></div>`).join(""):'<p class="muted">No organisation changes recorded yet.</p>';
  const empBody=document.querySelector("#page-workforce .table-panel tbody");if(empBody){const incumbents=positions.filter(p=>p.person);empBody.innerHTML=incumbents.map(p=>`<tr><td><div class="person-cell"><i class="avatar avatar-small blue-avatar">${esc(p.person.split(/\\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase())}</i><span><b>${esc(p.person)}</b><small>${esc(p.employeeId)}</small></span></div></td><td>${esc(p.role)}</td><td>${esc(p.dept)}</td><td>—</td><td><span class="status-pill status-muted">Not linked</span></td><td><span class="status-pill status-muted">Not verified</span></td></tr>`).join("");}
  rows.innerHTML=list.map(p=>{const allowed=canManage(p);return `<tr class="${allowed?"":"org-muted"}"><td><span class="org-role">${esc(p.role)}</span><span class="org-sub">${esc(p.id)}</span></td><td>${esc(p.dept)}</td><td>${esc(parentName(p.parent))}</td><td>${esc(p.zoneId?(linkOptions().map.find(z=>z.id===p.zoneId)?.name||p.zoneId):"Not linked")}</td><td>${p.person?`<b>${esc(p.person)}</b><span class="org-sub">${esc(p.employeeId)}</span>`:"—"}</td><td><span class="status-pill ${p.person?"status-good":"status-review"}">${p.person?"Occupied":"Vacant"}</span></td><td><div class="org-actions">${allowed?`<button class="btn btn-secondary" data-org="assign" data-id="${p.id}">${p.person?"Replace / reassign":"Assign"}</button><button class="btn btn-secondary" data-org="linkzone" data-id="${p.id}">${p.zoneId?"Change zone":"Link site zone"}</button>${p.person?`<button class="btn btn-secondary" data-org="vacate" data-id="${p.id}">Vacate</button>`:""}`:`<span class="org-sub">No authority</span>`}</div></td></tr>`}).join("");
 }
 function promptAssign(p){
   const name=prompt(`${p.person?"Replace / reassign incumbent":"Assign incumbent"} for ${p.role}\nEnter employee full name:`,p.person||"");
   if(name===null||!name.trim())return;
   const id=prompt("Enter employee ID:",p.employeeId||"EMP-");
   if(id===null||!id.trim())return;
   const prior=p.person;p.person=name.trim();p.employeeId=id.trim();p.status="Occupied";
   save(prior?"REASSIGN / REPLACE":"ASSIGN",`${p.id} ${p.role}: ${prior||"Vacant"} → ${p.person} (${p.employeeId})`);
   render();showToast(prior?"Position incumbent replaced/reassigned.":"Position assigned.");
 }
 function linkPositionToZone(p){
  ensureFeatureIds();const opts=linkOptions();
  if(!opts.map.length){showToast("Draw and save at least one zone in Satellite View first.");return;}
  const mapMenu=opts.map.map((z,i)=>`${i+1}. ${z.name} [${z.id}]`).join("\n");
  const pick=prompt(`Choose the satellite/vector zone for ${p.role}:\n${mapMenu}\nEnter its number (0 to unlink):`,String(Math.max(1,opts.map.findIndex(z=>z.id===p.zoneId)+1)));
  if(pick===null)return;const n=Number(pick);if(!Number.isInteger(n)||n<0||n>opts.map.length){showToast("Invalid zone selection.");return;}
  p.zoneId=n===0?"":opts.map[n-1].id;
  let drawingId="";
  if(opts.drawing.length){const menu=opts.drawing.map((z,i)=>`${i+1}. ${z.name} [${z.id}]`).join("\n");const dp=prompt(`Choose the matching engineering-drawing annotation (optional):\n${menu}\nEnter number, or 0 for none:`, "0");if(dp===null)return;const dn=Number(dp);if(Number.isInteger(dn)&&dn>0&&dn<=opts.drawing.length)drawingId=opts.drawing[dn-1].id;}
  p.drawingId=drawingId;save("LINK SITE ZONE",`${p.id} ${p.role} linked to ${p.zoneId||"no satellite zone"}${drawingId?` and drawing ${drawingId}`:""}`);updateZoneAssignments();render();showToast("Position linked to site map zone.");
 }
 rows.addEventListener("click",e=>{const b=e.target.closest("[data-org]");if(!b)return;const p=positions.find(x=>x.id===b.dataset.id);if(!p||!canManage(p)){showToast("Your selected role cannot manage this position.");return}
  if(b.dataset.org==="assign")promptAssign(p);
  if(b.dataset.org==="linkzone")linkPositionToZone(p);
  if(b.dataset.org==="vacate"&&confirm(`Remove ${p.person} from ${p.role}? This keeps the position but marks it vacant.`)){const old=p.person;p.person="";p.employeeId="";p.status="Vacant";save("VACATE",`${p.id} ${p.role}: ${old}`);render();showToast("Position marked vacant.");}
 });
 $("#orgAddPosition").addEventListener("click",()=>{
  const role=prompt("Position title (choose an existing hierarchy role or enter a custom title):","Technician");if(!role)return;
  const dept=prompt("Department:","Operations");if(!dept)return;
  const myRank=rank(acting.value);if(myRank<8){showToast("Only Department Incharge or above can create positions in this prototype.");return}
  const parent=positions.find(x=>x.role===acting.value&&x.person)||positions.find(x=>rank(x.role)===myRank);
  const id="POS-"+String(Math.max(0,...positions.map(x=>Number(x.id.split("-")[1])||0))+1).padStart(3,"0");
  positions.push({id,role:role.trim(),dept:dept.trim(),parent:parent?.id||"",person:"",employeeId:"",status:"Vacant"});save("CREATE POSITION",`${id} ${role} · ${dept}`);render();showToast("Position created.");
 });
 [acting,$("#orgDepartment"),$("#orgSearch")].forEach(el=>el.addEventListener("change",render));
 $("#orgSearch").addEventListener("input",render);
 acting.addEventListener("change",()=>showToast(`Prototype authority view: ${acting.value}. This selector is for testing only.`));
 window.PlantTrackerOrg={getPositions:()=>structuredClone(positions),getAudit:()=>structuredClone(audit),refresh:render,zoneOptions:linkOptions};
 window.addEventListener("storage",e=>{if(e.key===MAP_KEY||e.key===DRAW_KEY||e.key===KEY||e.key===AUDIT)render();});
 window.addEventListener("planttracker:remotechange",()=>{try{positions=JSON.parse(localStorage.getItem(KEY))||positions;audit=JSON.parse(localStorage.getItem(AUDIT))||audit;render();}catch(e){console.error("Could not refresh remote workforce data",e);}});
 render();
})();

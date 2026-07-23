import{jsPDF}from'jspdf'
import autoTable from'jspdf-autotable'
import{n,fmt,formatDate}from'./utils'

const C={gold:[180,100,0],goldL:[250,235,195],white:[255,255,255],dark:[24,24,27],mid:[80,80,90],light:[247,247,248],green:[5,150,105],red:[220,38,38],blue:[37,99,235],violet:[124,58,237]}
const PW=210,ML=14,MR=14,CW=PW-ML-MR

function hdr(doc,t1,t2,modeColor=C.gold){
  doc.setFillColor(...C.dark);doc.rect(0,0,PW,20,'F')
  doc.setFillColor(...modeColor);doc.roundedRect(ML,4,12,12,2,2,'F')
  doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(...C.dark);doc.text('AX',ML+2,12)
  doc.setTextColor(...C.white);doc.setFontSize(13);doc.text('AurreX',ML+17,11)
  doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(200,180,130);doc.text('Jewellery Management',ML+17,16.5)
  doc.setFontSize(8.5);doc.setFont('helvetica','bold');doc.setTextColor(...C.white);doc.text(t1,PW-MR,10,{align:'right'})
  if(t2){doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(200,180,130);doc.text(t2,PW-MR,16.5,{align:'right'})}
  doc.setTextColor(...C.dark)
}
function foot(doc){const pc=doc.internal.getNumberOfPages();for(let i=1;i<=pc;i++){doc.setPage(i);doc.setFillColor(...C.light);doc.rect(0,287,PW,10,'F');doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(...C.mid);doc.text('AurreX - Jewellery Management System',ML,293);doc.text('Page '+i+' of '+pc,PW-MR,293,{align:'right'})}}
function secH(doc,txt,y,color=C.goldL){doc.setFillColor(...color);doc.roundedRect(ML,y,CW,7.5,1,1,'F');doc.setFontSize(8.5);doc.setFont('helvetica','bold');doc.setTextColor(...C.gold);doc.text(txt,ML+4,y+5.2);doc.setTextColor(...C.dark);return y+11}
function kv(doc,k,v,y,hi=false){if(hi){doc.setFillColor(255,250,235);doc.rect(ML,y-3.5,CW,6.5,'F')}doc.setFontSize(8.5);doc.setFont('helvetica','bold');doc.setTextColor(...C.mid);doc.text(k+':',ML+3,y);doc.setFont('helvetica','normal');doc.setTextColor(...C.dark);doc.text(String(v),ML+80,y);return y+6.5}
const tblS=(head)=>({styles:{fontSize:8,cellPadding:3,textColor:C.dark,lineColor:[225,225,225],lineWidth:0.2},headStyles:{fillColor:C.gold,textColor:C.white,fontStyle:'bold',fontSize:8},alternateRowStyles:{fillColor:[252,250,246]},footStyles:{fillColor:C.goldL,textColor:C.dark,fontStyle:'bold',fontSize:8},margin:{left:ML,right:MR},head:[head]})

export function generateProjectPDF(proj,sd,sel){
  const doc=new jsPDF({unit:'mm',format:'a4'})
  const gen=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  const simple=proj.projectType==='simple'
  hdr(doc,simple?'Simple Project Report':'Detailed Project Report','Generated: '+gen)
  let y=27
  doc.setFillColor(...C.goldL);doc.roundedRect(ML,y,CW,20,3,3,'F')
  doc.setFontSize(15);doc.setFont('helvetica','bold');doc.setTextColor(...C.dark);doc.text(proj.setName||'Project',ML+5,y+9)
  doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(...C.mid);doc.text('Given By: '+proj.givenBy,ML+5,y+16)
  const sc=proj.status==='completed'?C.green:C.gold;doc.setTextColor(...sc);doc.setFontSize(8);doc.setFont('helvetica','bold');doc.text(proj.status==='completed'?'Completed':'Ongoing',PW-MR-3,y+9,{align:'right'})
  y+=26
  if(sel.has('basicInfo')){y=secH(doc,'Basic Information',y);y=kv(doc,'Start Date',formatDate(proj.startDate),y);y=kv(doc,'Submission Date',formatDate(proj.submissionDate),y);y=kv(doc,'Wastage %',proj.wastagePercent+'%',y);y=kv(doc,'Pay Per Gem','Rs.'+proj.payPerGem,y);y+=3}
  if(sel.has('goldOps')&&(proj.goldOperations||[]).length>0){if(y>230){doc.addPage();hdr(doc,'Gold Operations',proj.setName);y=27}y=secH(doc,'Gold Operations',y);autoTable(doc,{...tblS(['Type','Amount (g)','Note']),body:(proj.goldOperations||[]).map(o=>[{content:o.type.replace(/_/g,' ').toUpperCase(),styles:{fontStyle:'bold',textColor:o.type==='add'?C.green:C.red}},{content:fmt(o.amount)+'g',styles:{halign:'right',fontStyle:'bold'}},o.note||'-']),startY:y});y=doc.lastAutoTable.finalY+6}
  if(sel.has('goldBox')){if(y>240){doc.addPage();hdr(doc,'Gold Box',proj.setName);y=27}y=secH(doc,'Gold Box Information',y);y=kv(doc,'Gold in Box',fmt(sd.goldInBox)+'g',y,true);if(!simple){y=kv(doc,'Waste in Box',fmt(sd.wasteInBox)+'g',y);y=kv(doc,'Tach in Box',fmt(sd.tachInBox)+'g',y)}y+=3}
  if(sel.has('goldCalc')&&!simple){if(y>220){doc.addPage();hdr(doc,'Gold Calculations',proj.setName);y=27}y=secH(doc,'Gold Calculations',y);y=kv(doc,'Roughly Gold Used',fmt(sd.roughGold)+'g',y);y=kv(doc,'Total Diff',fmt(sd.totalDiff)+'g',y,true);y+=3}
  if(sel.has('summary')){if(y>210){doc.addPage();hdr(doc,'Summary',proj.setName);y=27}y=secH(doc,'Project Summary',y);if(simple){y=kv(doc,'Gold Used',fmt(sd.simpleUsed)+'g',y);y=kv(doc,'Gold Used With Wastage',fmt(sd.simpleWithW)+'g',y,true)}else{y=kv(doc,'Gold Used Without Wastage',fmt(sd.goldWithout)+'g',y);y=kv(doc,'Gold Used With Wastage',fmt(sd.goldWith)+'g',y,true)}y=kv(doc,'Total Gems',String(proj.totalGems),y);y=kv(doc,'Gems Price','Rs.'+fmt(proj.gemsPrice),y);y=kv(doc,'Total Payment','Rs.'+fmt(sd.mainPay),y,true);y+=3}
  if(sel.has('gemCount')){const gc=proj.gemCount||{};if(gc.pakalGems>0||gc.tacchiGems>0||(gc.customTypes||[]).length>0){if(y>230){doc.addPage();hdr(doc,'Gem Count',proj.setName);y=27}y=secH(doc,'Gem Count',y);y=kv(doc,'PAKAI Gems',String(gc.pakalGems||0),y);y=kv(doc,'TACHHI Gems',String(gc.tacchiGems||0),y);(gc.customTypes||[]).forEach(ct=>{y=kv(doc,ct.name,String(ct.count),y)});y+=3}}
  if(sel.has('setSummary')&&(sd.allSets||[]).length>0){if(y>220){doc.addPage();hdr(doc,'Set Summary',proj.setName);y=27}y=secH(doc,'Set Summary',y);autoTable(doc,{...tblS(['Set/Section','Gold Used (g)','Gems','Gem Price','Total Pay']),body:(sd.allSets||[]).map((s,i)=>[{content:s.name,styles:{fontStyle:i===0?'bold':'normal'}},{content:fmt(s.goldUsed),styles:{halign:'right'}},{content:String(s.totalGems),styles:{halign:'right'}},{content:'Rs.'+fmt(s.gemPrice),styles:{halign:'right'}},{content:'Rs.'+fmt(s.totalPayment),styles:{halign:'right',fontStyle:'bold',textColor:C.gold}}]),foot:[['Grand Total',{content:fmt(sd.grandGold),styles:{halign:'right'}},{content:String(sd.grandGems),styles:{halign:'right'}},'',{content:'Rs.'+fmt(sd.grandPay),styles:{halign:'right'}}]],showFoot:'lastPage',startY:y});y=doc.lastAutoTable.finalY+6}
  if(!simple){
    if(sel.has('pakalTable')&&(proj.pakalTable||[]).length>0){doc.addPage();hdr(doc,'Pakal Table',proj.setName);autoTable(doc,{...tblS(['User','Wt Before','Gold Given','Gold Used','Wt After','Gold Rcvd','Waste','Gems','Diff']),body:(proj.pakalTable||[]).map(r=>{const gu=n(r.itemWeightBefore)-n(r.itemWeightAfter);const d=n(r.itemWeightBefore)+n(r.goldGiven)-n(r.itemWeightAfter)-n(r.goldReceived)-n(r.wasteGoldTaken);return[r.user||'-',fmt(r.itemWeightBefore),fmt(r.goldGiven),{content:fmt(gu),styles:{textColor:C.blue,fontStyle:'bold'}},fmt(r.itemWeightAfter),fmt(r.goldReceived),fmt(r.wasteGoldTaken),r.gems,{content:fmt(d),styles:{textColor:C.gold,fontStyle:'bold'}}]}),startY:27})}
    if(sel.has('tachhiTable')&&(proj.tachhiTable||[]).length>0){const sy=doc.lastAutoTable?doc.lastAutoTable.finalY+10:27;if(sy>230){doc.addPage();hdr(doc,'Tachhi Table',proj.setName)}autoTable(doc,{...tblS(['User','Wt Before','Wt After','Tach','Gems','Diff']),body:(proj.tachhiTable||[]).map(r=>{const d=n(r.itemWeightAfter)+n(r.tach)-n(r.itemWeightBefore);return[r.user||'-',fmt(r.itemWeightBefore),fmt(r.itemWeightAfter),fmt(r.tach),r.gems,{content:fmt(d),styles:{textColor:C.gold,fontStyle:'bold'}}]}),startY:doc.lastAutoTable?doc.lastAutoTable.finalY+10:27})}
    if(sel.has('billPrint')){doc.addPage();hdr(doc,'Bill / Grand Summary',proj.setName);let by=27;by=secH(doc,'Grand Summary - Bill Print',by);autoTable(doc,{...tblS(['Section','Total Gems','Total Pay']),body:(sd.allSets||[]).map(s=>[s.name,String(s.totalGems),'Rs.'+fmt(s.totalPayment)]),foot:[['GRAND TOTAL',String(sd.grandGems),'Rs.'+fmt(sd.grandPay)]],showFoot:'lastPage',startY:by});by=doc.lastAutoTable.finalY+8;doc.setFillColor(...C.goldL);doc.roundedRect(ML,by,CW,20,3,3,'F');doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text('Total Payment Due',ML+5,by+9);doc.setFontSize(18);doc.setTextColor(...C.gold);doc.text('Rs.'+fmt(sd.grandPay),ML+5,by+17);doc.setTextColor(...C.dark)}
  }
  if(sel.has('notes')&&proj.notes){doc.addPage();hdr(doc,'Notes',proj.setName);doc.setFontSize(9);doc.setFont('helvetica','normal');doc.text(doc.splitTextToSize(proj.notes,CW),ML,32)}
  foot(doc)
  doc.save('AurreX-'+(proj.setName||'Project')+'-Report.pdf')
}

export function generateConnectionPDF(conn,sd){
  const doc=new jsPDF({unit:'mm',format:'a4'})
  const gen=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  hdr(doc,conn.type+' Connection Report','Generated: '+gen)
  let y=27
  doc.setFillColor(...C.goldL);doc.roundedRect(ML,y,CW,18,3,3,'F')
  doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(...C.dark);doc.text(conn.name,ML+5,y+8)
  doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(...C.mid);doc.text('Type: '+conn.type,ML+5,y+14.5)
  y+=23;y=secH(doc,'Account Summary',y)
  doc.setFillColor(255,252,242);doc.roundedRect(ML,y,CW,conn.type!=='Staff'?20:13,2,2,'F')
  doc.setFontSize(8.5);doc.setFont('helvetica','bold');doc.setTextColor(...C.mid);doc.text('Amount Balance:',ML+4,y+7);doc.setTextColor(...(sd.amount>=0?C.green:C.red));doc.setFontSize(11);doc.text('Rs.'+fmt(sd.amount),ML+52,y+7)
  if(conn.type!=='Staff'){doc.setFontSize(8.5);doc.setFont('helvetica','bold');doc.setTextColor(...C.mid);doc.text('Gold Balance:',ML+4,y+14);doc.setTextColor(...(sd.gold>=0?C.green:C.red));doc.setFontSize(11);doc.text(fmt(sd.gold)+'g',ML+52,y+14)}
  doc.setTextColor(...C.dark);y+=(conn.type!=='Staff'?25:18)
  const addTbl=(title,head,rows)=>{if(!rows||rows.length===0)return;if(y>230){doc.addPage();hdr(doc,title,conn.name);y=27}y=secH(doc,title,y);autoTable(doc,{...tblS(head),body:rows,startY:y});y=doc.lastAutoTable.finalY+7}
  if(conn.type==='Boss'){addTbl('Set Entry',['Set Name','Gold (g)','Gems','Amount','Total Pay','Date'],(conn.setEntry||[]).map(r=>[r.setName||'-',fmt(r.goldWeight)+'g',String(r.totalGem),'Rs.'+fmt(r.amount),'Rs.'+fmt(r.totalPayment),r.date||'-']));addTbl('Gold Entry',['Gold Weight (g)','Date'],(conn.goldEntry||[]).map(r=>[fmt(r.goldWeight)+'g',r.date||'-']));addTbl('Payment Entry',['Amount','Note','Date'],(conn.paymentEntry||[]).map(r=>['Rs.'+fmt(r.amount),r.note||'-',r.date||'-']))}
  else if(conn.type==='Mates'){addTbl('Give-Set Entry',['Set Name','Gold (g)','Gems','Amount','Total Pay','Date'],(conn.giveSetEntry||[]).map(r=>[r.setName||'-',fmt(r.goldWeight)+'g',String(r.totalGem),'Rs.'+fmt(r.amount),'Rs.'+fmt(r.totalPayment),r.date||'-']));addTbl('Give-Payment Entry',['Amount','Note','Date'],(conn.givePaymentEntry||[]).map(r=>['Rs.'+fmt(r.amount),r.note||'-',r.date||'-']));addTbl('Take-Set Entry',['Set Name','Gold (g)','Gems','Amount','Total Pay','Date'],(conn.takeSetEntry||[]).map(r=>[r.setName||'-',fmt(r.goldWeight)+'g',String(r.totalGem),'Rs.'+fmt(r.amount),'Rs.'+fmt(r.totalPayment),r.date||'-']));addTbl('Take-Payment Entry',['Amount','Note','Date'],(conn.takePaymentEntry||[]).map(r=>['Rs.'+fmt(r.amount),r.note||'-',r.date||'-']))}
  else if(conn.type==='Staff'){addTbl('Gem Entry',['Set Name','Gems','Price/Gem','Amount','Date'],(conn.gemEntry||[]).map(r=>[r.setName||'-',String(r.gem),'Rs.'+fmt(r.pricePerGem),'Rs.'+fmt(r.amount),r.date||'-']));addTbl('Payment Entry',['Amount','Note','Date'],(conn.staffPaymentEntry||[]).map(r=>['Rs.'+fmt(r.amount),r.note||'-',r.date||'-']))}
  else if(conn.type==='Payment'){addTbl('Payment Given',['Amount','Note','Date'],(conn.paymentGiven||[]).map(r=>['Rs.'+fmt(r.amount),r.note||'-',r.date||'-']));addTbl('Payment Received',['Amount','Note','Date'],(conn.paymentReceived||[]).map(r=>['Rs.'+fmt(r.amount),r.note||'-',r.date||'-']))}
  if(conn.notes){if(y>240){doc.addPage();hdr(doc,'Notes',conn.name);y=27}y=secH(doc,'Notes',y);doc.setFontSize(9);doc.text(doc.splitTextToSize(conn.notes,CW),ML,y)}
  foot(doc)
  doc.save('AurreX-'+conn.name+'-'+conn.type+'-Report.pdf')
}

export function generateStaffPDF(conn,sd){
  const doc=new jsPDF({unit:'mm',format:'a4'})
  const gen=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  hdr(doc,'Staff Work Report','Generated: '+gen,C.blue)
  let y=27
  doc.setFillColor(235,245,255);doc.roundedRect(ML,y,CW,18,3,3,'F')
  doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(...C.dark);doc.text(conn.name,ML+5,y+8)
  doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(...C.blue);doc.text('Staff Mode - Boss Connection',ML+5,y+14.5)
  y+=23;y=secH(doc,'Account Summary',y,[235,245,255])
  doc.setFillColor(235,245,255);doc.roundedRect(ML,y,CW,22,2,2,'F')
  y+=3;y=kv(doc,'Total Gem Work','Rs.'+fmt(sd.gemTotal),y);y=kv(doc,'Total Received','Rs.'+fmt(sd.paidTotal),y);y=kv(doc,'Balance','Rs.'+fmt(sd.balance),y,true);y+=5
  y=secH(doc,'Gem Entry',y,[235,245,255])
  autoTable(doc,{...tblS(['Set Name','Gems','Price/Gem','Amount','Date']),body:(conn.gemEntry||[]).map(r=>[r.setName||'-',String(r.gem),'Rs.'+fmt(r.pricePerGem),{content:'Rs.'+fmt(r.amount),styles:{fontStyle:'bold',textColor:C.gold}},r.date||'-']),foot:[['Total','','','Rs.'+fmt(sd.gemTotal),'']],showFoot:'lastPage',startY:y})
  y=doc.lastAutoTable.finalY+8;y=secH(doc,'Payment Entry',y,[235,245,255])
  autoTable(doc,{...tblS(['Amount','Note','Date']),body:(conn.staffPaymentEntry||[]).map(r=>[{content:'Rs.'+fmt(r.amount),styles:{textColor:C.green,fontStyle:'bold'}},r.note||'-',r.date||'-']),foot:[['Rs.'+fmt(sd.paidTotal),'','']],showFoot:'lastPage',startY:doc.lastAutoTable.finalY+8})
  if(conn.notes){doc.addPage();hdr(doc,'Notes',conn.name,C.blue);doc.setFontSize(9);doc.text(doc.splitTextToSize(conn.notes,CW),ML,32)}
  foot(doc)
  doc.save('AurreX-Staff-'+conn.name+'-Report.pdf')
}

export function generateSetPDF(set){
  const doc=new jsPDF({unit:'mm',format:'a4'})
  const gen=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  hdr(doc,'Set Report - Manager Mode','Generated: '+gen,C.violet)
  let y=27
  doc.setFillColor(245,240,255);doc.roundedRect(ML,y,CW,20,3,3,'F')
  doc.setFontSize(15);doc.setFont('helvetica','bold');doc.setTextColor(...C.dark);doc.text(set.setName||'Set',ML+5,y+9)
  doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(...C.mid);doc.text('Given By: '+(set.givenBy||'-'),ML+5,y+16)
  y+=26;y=secH(doc,'Basic Details',y,[245,240,255])
  y=kv(doc,'Gold Used',fmt(set.goldUsed)+'g',y);y=kv(doc,'Total Gems',String(set.totalGems),y);y=kv(doc,'Gem Price','Rs.'+fmt(set.gemPrice),y);y+=3
  const totalPay=(set.gemTable||[]).reduce((s,r)=>s+(n(r.totalGems)*n(r.pricePerGem))+n(r.gemPrice),0)
  if((set.gemTable||[]).length>0){y=secH(doc,'Gem Table',y,[245,240,255]);autoTable(doc,{...tblS(['Gem Type','Weight','Unit','Gem Price','Price/Gem','Total Gems','Payment']),body:(set.gemTable||[]).map(r=>[r.gemType||'-',fmt(r.gemWeight),r.gemWeightUnit||'gram','Rs.'+fmt(r.gemPrice),'Rs.'+fmt(r.pricePerGem),String(r.totalGems),'Rs.'+fmt(n(r.totalGems)*n(r.pricePerGem)+n(r.gemPrice))]),startY:y});y=doc.lastAutoTable.finalY+8}
  if((set.persons||[]).length>0){if(y>220){doc.addPage();hdr(doc,'Set Details',set.setName,C.violet);y=27}y=secH(doc,'Persons',y,[245,240,255]);autoTable(doc,{...tblS(['Name','Gold Used (g)','Total Gems']),body:(set.persons||[]).map(r=>[r.name||'-',fmt(r.goldUsed)+'g',String(r.totalGems)]),startY:y});y=doc.lastAutoTable.finalY+8}
  if(y>230){doc.addPage();hdr(doc,'Set Summary',set.setName,C.violet);y=27}
  doc.setFillColor(245,240,255);doc.roundedRect(ML,y,CW,18,3,3,'F')
  doc.setFontSize(10);doc.setFont('helvetica','bold');doc.text('Total Payment',ML+5,y+8);doc.setFontSize(18);doc.setTextColor(...C.violet);doc.text('Rs.'+fmt(totalPay),ML+5,y+16);doc.setTextColor(...C.dark)
  if(set.notes){doc.addPage();hdr(doc,'Notes',set.setName,C.violet);doc.setFontSize(9);doc.text(doc.splitTextToSize(set.notes,CW),ML,32)}
  foot(doc)
  doc.save('AurreX-Set-'+(set.setName||'Set')+'-Report.pdf')
}

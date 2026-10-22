const $=s=>document.querySelector(s),app=$('#app');let ME=null,CFG={};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2800)};
const readImg=f=>new Promise((ok,no)=>{if(!f)return ok('');if(f.size>1.8e6)return no(new Error('الصورة أكبر من 1.8MB'));const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(f)});
const ST={awaiting_payment:'بانتظار الدفع',pending:'بانتظار القبول',accepted:'مقبول',rejected:'مرفوض',delivered:'تم التسليم'};
const STY=[['Primary','أزرق','#5865f2'],['Secondary','رمادي شفاف','#4e5058'],['Success','أخضر','#248046'],['Danger','أحمر','#da373c']];
const need=()=>{app.innerHTML=`<div class="c" style="padding:80px 0"><img src="img/logo.png" width="110"><h1 style="margin:16px 0">سجّل دخولك أولاً</h1><p class="mut" style="margin-bottom:20px">اربط حساب ديسكورد للمتابعة.</p><button class="btn" onclick="doLogin(location.hash)">ربط حساب ديسكورد</button></div>`};
const modal=h=>{const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="card">${h}</div>`;m.onclick=e=>{if(e.target===m)m.remove()};document.body.append(m);return m};
const guard=f=>async(...a)=>{try{await f(...a)}catch(e){toast(e.message)}};
const sw=(id,label,on)=>`<label class="sw"><span>${label}</span><input type="checkbox" id="${id}" ${on?'checked':''}><i></i></label>`;

function nav(){
  $('#nav').innerHTML=ME?`<div class="av"><img src="${esc(ME.avatarUrl)}" id="avb"><div class="menu" id="menu"><b>${esc(ME.username)}</b><a href="#/stores">لوحة التحكم</a>${ME.isOwner?'<a href="#/admin">إدارة المنصة</a>':''}<button id="out">تسجيل خروج</button></div></div>`
   :`<button class="btn sm" id="lg">ربط حساب ديسكورد</button>`;
  if(ME){$('#avb').onclick=e=>{e.stopPropagation();$('#menu').classList.toggle('on')};$('#out').onclick=doLogout}else $('#lg').onclick=()=>doLogin(location.hash);
  $('#foot').innerHTML=CFG.support?`<a class="btn disc" href="${esc(CFG.support)}" target="_blank" rel="noopener">💬 تواصل معنا على ديسكورد</a>`:'';
}
document.addEventListener('click',()=>$('#menu')?.classList.remove('on'));

/* ---------- الصفحات العامة ---------- */
function home(){
  const F=[['🔗','ربط فوري','سجّل بحساب ديسكورد واختر السيرفر الذي تديره.'],['📦','منتجات احترافية','اسم ووصف وصورة وسعر، مع رتبة تُمنح تلقائياً.'],['💳','طرق دفع متعددة','بنوك، STC Pay، UR Pay، روابط دفع وQR.'],['🎫','لوحة شراء مخصصة','بنر وإيموجي ولون زر تختارهم بنفسك.'],['🚀','تسليم في الخاص','المنتج يصل للمشتري وحده برسالة خاصة.'],['📊','متابعة كاملة','طلباتك ومبيعاتك في لوحة واحدة مرتبة.']];
  const S=[['اربط حسابك','سجّل دخولك عبر ديسكورد.'],['أضف البوت','اختر سيرفرك وأضف بوت Orbit.'],['جهّز متجرك','أضف المنتجات وبيانات الدفع.'],['انشر اللوحة','انشر زر الشراء في أي روم وابدأ البيع.']];
  app.innerHTML=`<section class="hero"><div><h1>متجرك داخل ديسكورد<br>يبيع عنك تلقائياً</h1><p>Orbit منصة شراء ذاتي مجانية بالكامل. يختار العميل المنتج من البوت، يحوّل المبلغ ويرفع الإيصال، وأنت تقبل الطلب وتسلّمه بضغطة زر.</p>
  <div class="row"><button class="btn" onclick="${ME?"location.hash='#/stores'":"doLogin('#/stores')"}">${ME?'فتح لوحة التحكم':'ابدأ مجاناً'}</button><a class="btn ghost" href="#/team">تعرّف على الطاقم</a></div></div><img class="logo" src="img/logo.png" alt="Orbit"></section>
  <section class="sec"><h2>الرئيسية</h2><p class="lead">Orbit وُجد ليجعل البيع داخل ديسكورد سهلاً ومرتباً. لا حاجة لتذاكر يدوية ولا انتظار؛ العميل يشتري بنفسه في أي وقت، وأنت تتحكم بكل شيء من لوحة واحدة: المنتجات، الطلبات، شكل لوحة الشراء، وطرق الدفع.</p></section>
  <section class="sec"><h2>كيف يعمل؟</h2><br><div class="grid">${S.map((x,i)=>`<div class="card step"><b class="n">${i+1}</b><h3>${x[0]}</h3><p class="mut">${x[1]}</p></div>`).join('')}</div></section>
  <section class="sec"><h2>المميزات</h2><br><div class="grid">${F.map(x=>`<div class="card"><div class="ic">${x[0]}</div><h3>${x[1]}</h3><p class="mut">${x[2]}</p></div>`).join('')}</div></section>`;
}
const team=guard(async()=>{const t=await api('/team');
  app.innerHTML=`<section class="sec" style="margin-top:20px"><h2>طاقم العمل</h2><p class="lead">الفريق الذي يقف خلف Orbit.</p><div class="grid">${t.map(m=>`<div class="card tm c st"><img src="${esc(m.avatarUrl)}" alt=""><h3>${esc(m.username)}</h3><span class="role">${esc(m.title)}</span></div>`).join('')||'<div class="card c mut st">لم تتم إضافة أعضاء بعد.</div>'}</div></section>`});
function terms(){app.innerHTML=`<div class="card st"><h2>الشروط والأحكام</h2><p class="mut" style="margin-top:12px">• المنصة وسيط تقني فقط، والبائع مسؤول عن منتجاته وتسليمها.<br>• لا تتحمل المنصة مسؤولية التحويلات البنكية بين البائع والمشتري.<br>• يُمنع بيع أي محتوى مخالف للأنظمة أو لشروط ديسكورد.<br>• يلزم ربط حساب ديسكورد لاستلام المنتج في الخاص.<br>• للمالك حق إيقاف أي متجر مخالف.</p></div>`}

/* ---------- اختيار السيرفر ---------- */
const stores=guard(async()=>{if(!ME)return need();const g=await api('/guilds');
  app.innerHTML=`<div class="dh"><h2>اختر السيرفر</h2></div><p class="mut" style="margin-bottom:20px">تظهر السيرفرات التي تملكها أو لديك فيها صلاحية Administrator.</p><div class="grid">${g.map(x=>`<div class="card c"><div class="sg" style="margin:0 auto 10px">${x.icon?`<img src="https://cdn.discordapp.com/icons/${x.id}/${x.icon}.png?size=64">`:esc(x.name[0])}</div><h3 style="margin-bottom:14px">${esc(x.name)}</h3>
  ${x.botIn?`<a class="btn sm" href="#/s/${x.id}">لوحة التحكم</a>`:`<a class="btn sm ghost" target="_blank" href="${esc(x.invite)}">إضافة البوت</a>`}</div>`).join('')||'<div class="card c mut st">لا توجد سيرفرات تملك فيها صلاحية Administrator</div>'}</div>`});

/* ---------- لوحة التاجر ---------- */
const dash=guard(async gid=>{if(!ME)return need();let tab='ov',D=await api('/stores/'+gid);const reload=async()=>{D=await api('/stores/'+gid);draw()};
  const draw=()=>{const O=D.orders,pend=O.filter(o=>o.status==='pending').length;
    const T=[['ov','📊','نظرة عامة'],['p','📦','المنتجات'],['o','🧾','الطلبات',pend],['t','🎫','التكت'],['pm','💳','بيانات الدفع']];
    app.innerHTML=`<div class="dl"><aside class="side"><div class="gn"><img src="img/logo.png" width="36"><b>لوحة التاجر</b></div>${T.map(t=>`<button data-t="${t[0]}" class="${tab===t[0]?'on':''}"><span>${t[1]}</span>${t[2]}${t[3]?`<span class="cnt">${t[3]}</span>`:''}</button>`).join('')}<button onclick="location.hash='#/stores'"><span>🔁</span>تغيير السيرفر</button></aside><section id="tb"></section></div>`;
    app.querySelectorAll('.side [data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});
    const tb=$('#tb'),head=(t,x='')=>`<div class="dh"><h2>${t}</h2>${x}</div>`;
    if(tab==='ov'){const ok=O.filter(o=>['accepted','delivered'].includes(o.status)),rev=ok.reduce((a,o)=>a+o.product.price,0);
      const chk=[[D.products.length,'أضف منتجاً واحداً على الأقل','p'],[D.payments.length,'أضف طريقة دفع','pm'],[0,'انشر لوحة الشراء في روم من قسم «التكت»','t']];
      tb.innerHTML=head('نظرة عامة')+`<div class="grid">${[['المنتجات',D.products.length],['طلبات بانتظار القبول',pend],['مبيعات مقبولة',ok.length],['الإيرادات (ر.س)',rev]].map(x=>`<div class="card c st"><div class="stat">${x[1]}</div><p class="mut">${x[0]}</p></div>`).join('')}</div>
      <div class="card st" style="margin-top:20px"><h3>خطوات البدء</h3><br>${chk.map(c=>`<p style="margin:8px 0">${c[0]?'✅':'⬜'} <a href="#" data-g="${c[2]}" style="color:var(--o1);text-decoration:none">${c[1]}</a></p>`).join('')}</div>`;
      tb.querySelectorAll('[data-g]').forEach(a=>a.onclick=e=>{e.preventDefault();tab=a.dataset.g;draw()})}
    if(tab==='p'){tb.innerHTML=head('إدارة المنتجات','<button class="btn" id="add">+ إضافة منتج</button>')+`<div class="pg">${D.products.map(p=>`<div class="card">${p.image?`<img class="pi" src="${esc(p.image)}">`:'<div class="ph">📦</div>'}<h3>${esc(p.name)}</h3><p class="mut">${esc(p.desc)}</p><div class="price">${p.price} ر.س</div><div class="row"><button class="btn sm ghost" data-e="${p.id}">تعديل</button><button class="btn sm red" data-d="${p.id}">حذف</button></div></div>`).join('')||'<p class="mut">لا توجد منتجات بعد.</p>'}</div>`;
      $('#add').onclick=()=>pform();tb.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>pform(D.products.find(p=>p.id===b.dataset.e)));
      tb.querySelectorAll('[data-d]').forEach(b=>b.onclick=guard(async()=>{if(!confirm('حذف المنتج؟'))return;await api(`/stores/${gid}/products/${b.dataset.d}`,{method:'DELETE'});reload()}))}
    if(tab==='o'){tb.innerHTML=head('الطلبات')+(O.map(o=>`<div class="card st" style="margin-bottom:12px"><div class="row sp"><h3>${esc(o.product.name)} — ${o.product.price} ر.س</h3><span class="badge b-${o.status}">${ST[o.status]}</span></div>
      <p class="mut">المشتري: ${esc(o.buyer.name)}${o.payer?` • المحوِّل: ${esc(o.payer)}`:''}${o.method?` • الطريقة: ${esc(o.method)}`:''}${o.roleErr?' • ⚠️ تعذّر منح الرتبة (ارفع رتبة البوت فوقها)':''}</p>${o.receipt?`<a href="${esc(o.receipt)}" target="_blank"><img class="rc" src="${esc(o.receipt)}"></a>`:''}
      <div class="row" style="margin-top:12px">${o.status==='pending'?`<button class="btn sm" data-a="accept" data-i="${o.id}">قبول</button><button class="btn sm red" data-a="reject" data-i="${o.id}">رفض</button>`:''}${o.status==='accepted'?`<button class="btn sm" data-a="deliver" data-i="${o.id}">تسليم المنتج</button>`:''}</div></div>`).join('')||'<p class="mut">لا توجد طلبات.</p>');
      tb.querySelectorAll('[data-a]').forEach(b=>b.onclick=guard(async()=>{const a=b.dataset.a,id=b.dataset.i;
        if(a==='deliver'){const m=modal(`<h3>تسليم المنتج</h3><label>رابط المنتج</label><input id="dl" placeholder="https://..."><label>الوصف / تعليمات الاستخدام</label><textarea id="dn" rows=4></textarea><br><br><button class="btn" id="go">إرسال في الخاص</button>`);
          $('#go').onclick=guard(async()=>{await api(`/stores/${gid}/orders/${id}/deliver`,{method:'POST',body:{link:$('#dl').value,note:$('#dn').value}});m.remove();toast('تم التسليم ✅');reload()})}
        else{await api(`/stores/${gid}/orders/${id}/${a}`,{method:'POST',body:{}});toast('تم');reload()}}))}
    if(tab==='t')ticket(tb,head);
    if(tab==='pm'){tb.innerHTML=head('بيانات الدفع','<button class="btn" id="addm">+ إضافة طريقة دفع</button>')+`<p class="mut" style="margin-bottom:16px">أضف أكثر من طريقة، والمشتري يختار ما يناسبه.</p><div class="pg">${D.payments.map(m=>`<div class="card pm"><div class="pmh"><h3>${esc(m.name)}</h3>${sw('a'+m.id,'مفعّلة',m.active)}</div>
        <p class="mut">${[m.bank,m.beneficiary,m.iban&&'IBAN',m.accountOn&&m.account&&'حساب',m.phoneOn&&m.phone&&'جوال',m.linkOn&&m.link&&'رابط',m.qr&&'QR'].filter(Boolean).map(esc).join(' • ')||'—'}</p><div class="row"><button class="btn sm ghost" data-e="${m.id}">تعديل</button><button class="btn sm red" data-d="${m.id}">حذف</button></div></div>`).join('')||'<p class="mut">لا توجد طرق دفع بعد.</p>'}</div>`;
      $('#addm').onclick=()=>mform();tb.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>mform(D.payments.find(m=>m.id===b.dataset.e)));
      tb.querySelectorAll('[data-d]').forEach(b=>b.onclick=guard(async()=>{if(!confirm('حذف طريقة الدفع؟'))return;await api(`/stores/${gid}/payments/${b.dataset.d}`,{method:'DELETE'});reload()}));
      D.payments.forEach(m=>{const e=$('#a'+m.id);e&&(e.onchange=guard(async()=>{await api(`/stores/${gid}/payments`,{method:'POST',body:{...m,qr:'',active:e.checked}});toast('تم');reload()}))})}
  };
  function ticket(tb,head){const t=D.ticket;let ban=t.banner,nb='',cl=false;
    tb.innerHTML=head('التكت — لوحة الشراء')+`<p class="mut" style="margin-bottom:16px">هذا شكل الرسالة التي تُنشر في الروم. ديسكورد يسمح بأربعة ألوان للأزرار فقط.</p><div class="cols"><div class="card st">
      <label>عنوان اللوحة</label><input id="tt" value="${esc(t.title)}"><label>الوصف</label><textarea id="td" rows=4>${esc(t.desc)}</textarea>
      <label>البنر (صورة اللوحة)</label><input type="file" id="tbn" accept="image/*"><div class="row" style="margin-top:8px"><button class="btn sm ghost" id="rmb">حذف البنر</button></div>
      <div class="row"><div style="flex:1"><label>نص الزر</label><input id="tl" value="${esc(t.btnLabel)}"></div><div style="width:120px"><label>إيموجي الزر</label><input id="te" value="${esc(t.btnEmoji)}" placeholder="🛒"></div></div>
      <label>لون الزر</label><div class="sty">${STY.map(s=>`<label><input type="radio" name="bs" value="${s[0]}" ${t.btnStyle===s[0]?'checked':''}><span style="background:${s[2]}">${s[1]}</span></label>`).join('')}</div>
      <label>لون شريط اللوحة</label><input type="color" id="tc" value="${esc(t.color)}"><br><button class="btn" id="tsv">حفظ التعديلات</button></div>
      <div><div class="dp" id="pv"></div><div class="card st" style="margin-top:14px"><label style="margin-top:0">الروم</label><select id="ch">${D.channels.map(c=>`<option value="${c.id}"># ${esc(c.name)}</option>`).join('')}</select><br><br><button class="btn" id="pub">🚀 نشر اللوحة في الروم</button><p class="mut" style="margin-top:8px">احفظ التعديلات أولاً ثم انشر.</p></div></div></div>`;
    const pv=()=>{const s=STY.find(x=>x[0]===(document.querySelector('[name=bs]:checked')?.value||'Primary'));
      $('#pv').innerHTML=`<div class="em" style="border-color:${esc($('#tc').value)}"><h4>${esc($('#tt').value)}</h4><p>${esc($('#td').value)}</p>${ban?`<img src="${esc(ban)}">`:''}</div><div class="bt" style="background:${s[2]}">${esc($('#te').value)} ${esc($('#tl').value)}</div>`};
    ['#tt','#td','#tl','#te','#tc'].forEach(i=>$(i).oninput=pv);tb.querySelectorAll('[name=bs]').forEach(r=>r.onchange=pv);
    $('#tbn').onchange=guard(async()=>{nb=await readImg($('#tbn').files[0]);ban=nb;cl=false;pv()});$('#rmb').onclick=()=>{ban='';nb='';cl=true;pv()};pv();
    $('#tsv').onclick=guard(async()=>{await api(`/stores/${gid}/ticket`,{method:'PUT',body:{title:$('#tt').value,desc:$('#td').value,btnLabel:$('#tl').value,btnEmoji:$('#te').value,btnStyle:document.querySelector('[name=bs]:checked').value,color:$('#tc').value,banner:nb,clearBanner:cl}});D=await api('/stores/'+gid);toast('تم الحفظ ✅')});
    $('#pub').onclick=guard(async()=>{await api(`/stores/${gid}/publish`,{method:'POST',body:{channelId:$('#ch').value}});toast('تم النشر في الروم ✅')})}
  function pform(p={}){const m=modal(`<h3>${p.id?'تعديل':'إضافة'} منتج</h3><label>اسم المنتج</label><input id="n" value="${esc(p.name)}"><label>الوصف</label><textarea id="d" rows=3>${esc(p.desc)}</textarea><label>السعر (ر.س)</label><input id="pr" type="number" value="${p.price||''}">
    <label>صورة المنتج</label><input type="file" id="im" accept="image/*"><label>الرتبة التي تُمنح بعد الشراء</label><select id="ro"><option value="">بدون رتبة</option>${D.roles.map(r=>`<option value="${r.id}" ${r.id===p.roleId?'selected':''}>${esc(r.name)}</option>`).join('')}</select><br><br><button class="btn" id="ok">حفظ المنتج</button>`);
    $('#ok').onclick=guard(async()=>{const image=await readImg($('#im').files[0]);await api(`/stores/${gid}/products`,{method:'POST',body:{id:p.id,name:$('#n').value,desc:$('#d').value,price:$('#pr').value,roleId:$('#ro').value,image}});m.remove();toast('تم الحفظ ✅');reload()})}
  function mform(p={}){const PR=['بنك الراجحي','البنك الأهلي','STC Pay','UR Pay','بنك آخر','رابط دفع'];
    const m=modal(`<h3>${p.id?'تعديل':'إضافة'} طريقة دفع</h3><label>اختر سريعاً</label><div class="chips">${PR.map(x=>`<button type="button" class="chip">${x}</button>`).join('')}</div>
      <label>اسم الطريقة (يظهر للمشتري)</label><input id="mn" value="${esc(p.name)}"><label>اسم البنك</label><input id="mb" value="${esc(p.bank)}"><label>اسم المستفيد</label><input id="mbn" value="${esc(p.beneficiary)}"><label>رقم الآيبان</label><input id="mi" dir="ltr" value="${esc(p.iban)}">
      ${sw('ao','رقم الحساب',p.accountOn)}<input id="ma" dir="ltr" value="${esc(p.account)}">${sw('po','رقم الجوال',p.phoneOn)}<input id="mp" dir="ltr" value="${esc(p.phone)}">${sw('lo','رابط دفع سريع',p.linkOn)}<input id="ml" dir="ltr" placeholder="https://" value="${esc(p.link)}">
      <label>صورة QR للتحويل السريع</label><input type="file" id="mq" accept="image/*">${p.qr?`<div class="row" style="margin-top:8px"><img class="qr" style="width:80px" src="${esc(p.qr)}"><label style="margin:0"><input type="checkbox" id="cq" style="width:auto"> حذف الـQR</label></div>`:''}<br><button class="btn" id="mok">حفظ</button>`);
    const sync=()=>[['ao','ma'],['po','mp'],['lo','ml']].forEach(([a,b])=>$('#'+b).style.display=$('#'+a).checked?'':'none');
    ['ao','po','lo'].forEach(i=>$('#'+i).onchange=sync);sync();
    m.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{$('#mn').value=c.textContent;if(c.textContent==='STC Pay'||c.textContent==='UR Pay'){$('#po').checked=true}if(c.textContent==='رابط دفع'){$('#lo').checked=true}sync()});
    $('#mok').onclick=guard(async()=>{const qr=await readImg($('#mq').files[0]);await api(`/stores/${gid}/payments`,{method:'POST',body:{id:p.id,active:p.active!==false,name:$('#mn').value,bank:$('#mb').value,beneficiary:$('#mbn').value,iban:$('#mi').value,account:$('#ma').value,accountOn:$('#ao').checked,phone:$('#mp').value,phoneOn:$('#po').checked,link:$('#ml').value,linkOn:$('#lo').checked,qr,clearQr:!!$('#cq')?.checked}});m.remove();toast('تم الحفظ ✅');reload()})}
  draw()});

/* ---------- صفحة الدفع ---------- */
const pay=guard(async id=>{if(!ME)return need();const o=await api('/order/'+id),P=o.pay;
  const cp=(l,v)=>v?`<label>${l}</label><div class="code" data-c="${esc(v)}">${esc(v)}</div>`:'';
  const mh=m=>`<div class="card st" style="margin-bottom:12px"><h3>${esc(m.name)}</h3>${cp('البنك',m.bank)}${cp('اسم المستفيد',m.beneficiary)}${cp('الآيبان',m.iban)}${m.accountOn?cp('رقم الحساب',m.account):''}${m.phoneOn?cp('رقم الجوال',m.phone):''}${m.linkOn&&m.link?`<br><a class="btn sm" target="_blank" rel="noopener" href="${esc(m.link)}">فتح رابط الدفع</a>`:''}${m.qr?`<div class="c"><br><img class="qr" src="${esc(m.qr)}"></div>`:''}</div>`;
  app.innerHTML=`<div style="max-width:620px;margin:auto"><div class="card st"><h2>إتمام الدفع</h2><div class="row sp" style="margin:14px 0"><b>${esc(o.product.name)}</b><span class="price">${o.product.price} ر.س</span></div><p class="mut">${esc(o.product.desc)}</p></div><br>
  ${o.status!=='awaiting_payment'?`<div class="card c st"><span class="badge b-${o.status}">${ST[o.status]}</span><p class="mut" style="margin-top:12px">${o.status==='pending'?'تم استلام الإيصال، بانتظار قبول التاجر. ستصلك رسالة في الخاص.':''}</p></div>`:
  `${P.map(mh).join('')||'<div class="card c mut st">لم يضف التاجر طرق دفع بعد.</div>'}<div class="card st"><label style="margin-top:0">الطريقة التي حوّلت بها</label><select id="pmth">${P.map(m=>`<option>${esc(m.name)}</option>`).join('')}</select><label>اسم المحوِّل</label><input id="py"><label>إيصال التحويل</label><input type="file" id="rc" accept="image/*"><br><br><button class="btn" id="sb" style="width:100%">تأكيد وإرسال الإيصال</button></div>`}</div>`;
  app.querySelectorAll('[data-c]').forEach(e=>e.onclick=()=>{navigator.clipboard?.writeText(e.dataset.c);toast('تم النسخ')});
  $('#sb')&&($('#sb').onclick=guard(async()=>{const receipt=await readImg($('#rc').files[0]);await api(`/order/${id}/pay`,{method:'POST',body:{payer:$('#py').value,receipt,method:$('#pmth').value}});toast('تم الإرسال ✅');pay(id)}))});

/* ---------- لوحة المالك ---------- */
const admin=guard(async()=>{if(!ME)return need();const s=await api('/admin/stats'),T=await api('/team');
  app.innerHTML=`<div class="dh"><h2>إدارة المنصة</h2></div><div class="grid">${[['سيرفرات فيها البوت',s.servers],['متاجر مفعّلة',s.stores],['مستخدمون ربطوا حساباتهم',s.users],['إجمالي الطلبات',s.orders],['عمليات بيع مقبولة',s.accepted],['تم تسليمها',s.delivered]].map(x=>`<div class="card c st"><div class="stat">${x[1]}</div><p class="mut">${x[0]}</p></div>`).join('')}</div>
  <section class="sec"><h2>طاقم العمل</h2><br><div class="card st"><div class="row"><button class="btn" id="me">➕ إضافة حسابي (${esc(ME.username)})</button></div><label>أو أضف عضواً بالآيدي</label><div class="row"><input id="tid" placeholder="Discord User ID" style="flex:1;min-width:180px"><input id="tti" placeholder="المسمى (مثال: مطوّر)" style="flex:1;min-width:150px"><button class="btn ghost" id="tad">إضافة</button></div></div><br>
  <div class="grid">${T.map(m=>`<div class="card tm c st"><img src="${esc(m.avatarUrl)}"><h3>${esc(m.username)}</h3><span class="role">${esc(m.title)}</span><br><br><button class="btn sm red" data-r="${m.id}">إزالة</button></div>`).join('')}</div></section>
  <section class="sec"><h2>رابط التواصل (ديسكورد)</h2><br><div class="card st"><input id="sup" dir="ltr" placeholder="https://discord.gg/..." value="${esc(CFG.support)}"><br><br><button class="btn" id="ssv">حفظ</button></div></section>`;
  const add=guard(async b=>{await api('/admin/team',{method:'POST',body:b});toast('تمت الإضافة ✅');admin()});
  $('#me').onclick=()=>add({title:$('#tti').value||'مالك المنصة'});$('#tad').onclick=()=>add({id:$('#tid').value,title:$('#tti').value});
  app.querySelectorAll('[data-r]').forEach(b=>b.onclick=guard(async()=>{await api('/admin/team/'+b.dataset.r,{method:'DELETE'});admin()}));
  $('#ssv').onclick=guard(async()=>{await api('/admin/site',{method:'PUT',body:{support:$('#sup').value}});CFG.support=$('#sup').value;nav();toast('تم الحفظ ✅')})});

async function route(){const[p,a]=(location.hash.slice(2)||'').split('/');scrollTo(0,0);
  document.querySelectorAll('nav>a').forEach(l=>l.classList.toggle('on',l.dataset.n===p));
  ({stores,s:()=>dash(a),pay:()=>pay(a),admin,terms,team}[p]||home)();}
(async()=>{try{ME=await api('/me')}catch{}try{CFG=await api('/config')}catch{}nav();route();addEventListener('hashchange',route)})();

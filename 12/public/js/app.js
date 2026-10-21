const $=s=>document.querySelector(s),app=$('#app');let ME=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2800)};
const readImg=f=>new Promise((ok,no)=>{if(!f)return ok('');if(f.size>1.8e6)return no(new Error('الصورة أكبر من 1.8MB'));const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(f)});
const ST={awaiting_payment:'بانتظار الدفع',pending:'بانتظار القبول',accepted:'مقبول',rejected:'مرفوض',delivered:'تم التسليم'};
const need=()=>{app.innerHTML=`<div class="hero"><h1>سجّل دخولك أولاً</h1><p>اربط حساب ديسكورد للمتابعة.</p><button class="btn" onclick="doLogin(location.hash)">ربط حساب ديسكورد</button></div>`};
const modal=h=>{const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="card">${h}</div>`;m.onclick=e=>{if(e.target===m)m.remove()};document.body.append(m);return m};
const guard=f=>async(...a)=>{try{await f(...a)}catch(e){toast(e.message)}};

function nav(){
  $('#nav').innerHTML=ME?`<div class="av"><img src="${esc(ME.avatarUrl)}" id="avb"><div class="menu" id="menu"><b>${esc(ME.username)}</b><a href="#/stores">لوحة التحكم</a>${ME.isOwner?'<a href="#/admin">إدارة المنصة</a>':''}<button id="out">تسجيل خروج</button></div></div>`
   :`<button class="btn sm" id="lg">ربط حساب ديسكورد</button>`;
  if(ME){$('#avb').onclick=e=>{e.stopPropagation();$('#menu').classList.toggle('on')};$('#out').onclick=doLogout}else $('#lg').onclick=()=>doLogin(location.hash);
}
document.addEventListener('click',()=>$('#menu')?.classList.remove('on'));

function home(){app.innerHTML=`<section class="hero"><h1>متجرك داخل ديسكورد<br>يبيع عنك تلقائياً</h1><p>اربط سيرفرك، أضف منتجاتك، واستلم الدفع بالتحويل البنكي. العميل يشتري من البوت، وأنت تقبل الطلب وتسلّمه في الخاص بضغطة زر.</p>
<button class="btn" onclick="${ME?"location.hash='#/stores'":"doLogin('#/stores')"}">${ME?'فتح لوحة التحكم':'ابدأ مجاناً'}</button></section>
<div class="grid">${[['🔗','اربط حسابك','سجّل بديسكورد واختر السيرفر الذي تملكه أو تديره'],['📦','أضف منتجاتك','اسم، وصف، صورة، سعر، ورتبة تُمنح تلقائياً'],['💳','دفع بالتحويل','آيبان وQR وإيصال، وتقبل الطلب من لوحتك'],['🚀','تسليم فوري','رابط المنتج يصل للمشتري وحده في الخاص']].map(x=>`<div class="card c"><div style="font-size:34px">${x[0]}</div><h3>${x[1]}</h3><p class="mut">${x[2]}</p></div>`).join('')}</div>`}

function terms(){app.innerHTML=`<div class="card"><h2>الشروط والأحكام</h2><p class="mut" style="margin-top:12px">• المنصة وسيط تقني فقط، والبائع مسؤول عن منتجاته وتسليمها.<br>• لا تتحمل المنصة مسؤولية التحويلات البنكية بين البائع والمشتري.<br>• يُمنع بيع أي محتوى مخالف للأنظمة أو لشروط ديسكورد.<br>• يلزم ربط حساب ديسكورد لاستلام المنتج في الخاص.<br>• للمالك حق إيقاف أي متجر مخالف.<br><br><i>عدّل هذا النص من ملف app.js (دالة terms).</i></p></div>`}

const stores=guard(async()=>{if(!ME)return need();const g=await api('/guilds');
  app.innerHTML=`<h2>اختر السيرفر</h2><p class="mut">تظهر هنا السيرفرات التي تملكها أو لديك فيها صلاحية Administrator.</p><br><div class="grid">${g.map(x=>`<div class="card c"><div class="sg" style="margin:0 auto 10px">${x.icon?`<img src="https://cdn.discordapp.com/icons/${x.id}/${x.icon}.png?size=64" width=44 style="border-radius:50%">`:esc(x.name[0])}</div><h3>${esc(x.name)}</h3><br>
  ${x.botIn?`<a class="btn sm" href="#/s/${x.id}">لوحة التحكم</a>`:`<a class="btn sm ghost" target="_blank" href="${esc(x.invite)}">إضافة البوت</a>`}</div>`).join('')||'<div class="card c mut">لا توجد سيرفرات تملك فيها صلاحية Administrator</div>'}</div>`});

const dash=guard(async gid=>{if(!ME)return need();let tab='p',D=await api('/stores/'+gid);
  const draw=()=>{const orders=D.orders;
    app.innerHTML=`<div class="row sp"><h2>لوحة التحكم</h2><a class="btn sm ghost" href="#/stores">تغيير السيرفر</a></div>
    <div class="tabs">${[['p','إدارة المنتجات'],['o','الطلبات ('+orders.filter(o=>o.status==='pending').length+')'],['s','بيانات الدفع']].map(t=>`<button data-t="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div><div id="tb"></div>`;
    app.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});
    const tb=$('#tb');
    if(tab==='p'){tb.innerHTML=`<button class="btn" id="add">+ إضافة منتج</button><br><br><div class="grid">${D.products.map(p=>`<div class="card">${p.image?`<img class="pi" src="${esc(p.image)}">`:''}<h3>${esc(p.name)}</h3><p class="mut">${esc(p.desc)}</p><div class="price">${p.price} ر.س</div><div class="row"><button class="btn sm ghost" data-e="${p.id}">تعديل</button><button class="btn sm red" data-d="${p.id}">حذف</button></div></div>`).join('')||'<p class="mut">لا توجد منتجات بعد.</p>'}</div><br><p class="mut">بعد إضافة المنتجات اكتب <b>/setup</b> في روم السيرفر لنشر لوحة الشراء.</p>`;
      $('#add').onclick=()=>pform();tb.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>pform(D.products.find(p=>p.id===b.dataset.e)));
      tb.querySelectorAll('[data-d]').forEach(b=>b.onclick=guard(async()=>{if(!confirm('حذف المنتج؟'))return;await api(`/stores/${gid}/products/${b.dataset.d}`,{method:'DELETE'});D=await api('/stores/'+gid);draw()}))}
    if(tab==='o')tb.innerHTML=orders.map(o=>`<div class="card" style="margin-bottom:12px"><div class="row sp"><h3>${esc(o.product.name)} — ${o.product.price} ر.س</h3><span class="badge b-${o.status}">${ST[o.status]}</span></div>
      <p class="mut">المشتري: ${esc(o.buyer.name)} ${o.payer?`• اسم المحوِّل: ${esc(o.payer)}`:''}${o.roleErr?' • ⚠️ تعذّر منح الرتبة (ارفع رتبة البوت فوقها)':''}</p>${o.receipt?`<a href="${esc(o.receipt)}" target="_blank"><img class="rc" src="${esc(o.receipt)}"></a>`:''}
      <div class="row" style="margin-top:12px">${o.status==='pending'?`<button class="btn sm" data-a="accept" data-i="${o.id}">قبول</button><button class="btn sm red" data-a="reject" data-i="${o.id}">رفض</button>`:''}${o.status==='accepted'?`<button class="btn sm" data-a="deliver" data-i="${o.id}">تسليم المنتج</button>`:''}</div></div>`).join('')||'<p class="mut">لا توجد طلبات.</p>';
    if(tab==='o')tb.querySelectorAll('[data-a]').forEach(b=>b.onclick=guard(async()=>{const a=b.dataset.a,id=b.dataset.i;
      if(a==='deliver'){const m=modal(`<h3>تسليم المنتج</h3><label>رابط المنتج</label><input id="dl" placeholder="https://..."><label>الوصف / تعليمات الاستخدام</label><textarea id="dn" rows=4></textarea><br><br><button class="btn" id="go">إرسال في الخاص</button>`);
        $('#go').onclick=guard(async()=>{await api(`/stores/${gid}/orders/${id}/deliver`,{method:'POST',body:{link:$('#dl').value,note:$('#dn').value}});m.remove();toast('تم التسليم ✅');D=await api('/stores/'+gid);draw()})}
      else{await api(`/stores/${gid}/orders/${id}/${a}`,{method:'POST',body:{}});toast('تم');D=await api('/stores/'+gid);draw()}}));
    if(tab==='s'){const s=D.settings;tb.innerHTML=`<div class="card"><div class="grid" style="gap:0 18px"><div><label>اسم البنك</label><input id="f1" value="${esc(s.bank)}"><label>رقم الحساب</label><input id="f2" value="${esc(s.account)}"></div><div><label>رقم الآيبان</label><input id="f3" value="${esc(s.iban)}" dir="ltr"><label>اسم المستفيد</label><input id="f4" value="${esc(s.beneficiary)}"></div></div>
      <label>صورة QR للتحويل السريع</label><input type="file" id="f5" accept="image/*">${s.qr?`<img class="qr" src="${esc(s.qr)}" style="margin-top:10px">`:''}<br><br><button class="btn" id="sv">حفظ</button></div>`;
      $('#sv').onclick=guard(async()=>{const qr=await readImg($('#f5').files[0]);const b={bank:$('#f1').value,account:$('#f2').value,iban:$('#f3').value,beneficiary:$('#f4').value};if(qr)b.qr=qr;await api(`/stores/${gid}/settings`,{method:'PUT',body:b});D=await api('/stores/'+gid);toast('تم الحفظ ✅');draw()})}
  };
  function pform(p={}){const m=modal(`<h3>${p.id?'تعديل':'إضافة'} منتج</h3><label>اسم المنتج</label><input id="n" value="${esc(p.name)}"><label>الوصف</label><textarea id="d" rows=3>${esc(p.desc)}</textarea><label>السعر (ر.س)</label><input id="pr" type="number" value="${p.price||''}">
    <label>صورة المنتج</label><input type="file" id="im" accept="image/*"><label>الرتبة التي تُمنح بعد الشراء</label><select id="ro"><option value="">بدون رتبة</option>${D.roles.map(r=>`<option value="${r.id}" ${r.id===p.roleId?'selected':''}>${esc(r.name)}</option>`).join('')}</select><br><br><button class="btn" id="ok">حفظ المنتج</button>`);
    $('#ok').onclick=guard(async()=>{const image=await readImg($('#im').files[0]);await api(`/stores/${gid}/products`,{method:'POST',body:{id:p.id,name:$('#n').value,desc:$('#d').value,price:$('#pr').value,roleId:$('#ro').value,image}});m.remove();D=await api('/stores/'+gid);toast('تم الحفظ ✅');draw()})}
  draw()});

const pay=guard(async id=>{if(!ME)return need();const o=await api('/order/'+id),p=o.pay;const cp=(l,v)=>v?`<label>${l}</label><div class="code" data-c="${esc(v)}">${esc(v)}</div>`:'';
  app.innerHTML=`<div class="card" style="max-width:560px;margin:auto"><h2>إتمام الدفع</h2><div class="row sp" style="margin:14px 0"><b>${esc(o.product.name)}</b><span class="price">${o.product.price} ر.س</span></div><p class="mut">${esc(o.product.desc)}</p><hr style="border-color:var(--line);margin:16px 0">
  ${o.status!=='awaiting_payment'?`<div class="c"><span class="badge b-${o.status}">${ST[o.status]}</span><p class="mut" style="margin-top:12px">${o.status==='pending'?'تم استلام الإيصال، بانتظار قبول التاجر. ستصلك رسالة في الخاص.':''}</p></div>`:
  `${cp('البنك',p.bank)}${cp('رقم الحساب',p.account)}${cp('الآيبان',p.iban)}${cp('اسم المستفيد',p.beneficiary)}${p.qr?`<div class="c"><br><img class="qr" src="${esc(p.qr)}"></div>`:''}
  <label>اسم المحوِّل</label><input id="py"><label>إيصال التحويل</label><input type="file" id="rc" accept="image/*"><br><br><button class="btn" id="sb" style="width:100%">تأكيد وإرسال الإيصال</button>`}</div>`;
  app.querySelectorAll('[data-c]').forEach(e=>e.onclick=()=>{navigator.clipboard?.writeText(e.dataset.c);toast('تم النسخ')});
  $('#sb')&&($('#sb').onclick=guard(async()=>{const receipt=await readImg($('#rc').files[0]);await api(`/order/${id}/pay`,{method:'POST',body:{payer:$('#py').value,receipt}});toast('تم الإرسال ✅');pay(id)}))});

const admin=guard(async()=>{if(!ME)return need();const s=await api('/admin/stats');
  app.innerHTML=`<h2>إدارة المنصة</h2><br><div class="grid">${[['سيرفرات فيها البوت',s.servers],['متاجر مفعّلة',s.stores],['مستخدمون ربطوا حساباتهم',s.users],['إجمالي الطلبات',s.orders],['عمليات بيع مقبولة',s.accepted],['تم تسليمها',s.delivered]].map(x=>`<div class="card c"><div class="stat">${x[1]}</div><p class="mut">${x[0]}</p></div>`).join('')}</div>`});

async function route(){const[p,a]=(location.hash.slice(2)||'').split('/');scrollTo(0,0);
  ({stores,s:()=>dash(a),pay:()=>pay(a),admin,terms}[p]||home)();}
(async()=>{try{ME=await api('/me')}catch{}nav();route();addEventListener('hashchange',route)})();

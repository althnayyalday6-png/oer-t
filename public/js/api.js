// الاتصال بالخادم (النسخة النهائية). في نسخة العرض يتم استبدال هذا الملف بملف وهمي.
async function api(p,o={}){
  const r=await fetch('/api'+p,{method:o.method||'GET',headers:{'Content-Type':'application/json'},body:o.body?JSON.stringify(o.body):undefined});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'حدث خطأ');return j;
}
const doLogin=next=>location.href='/auth/login?next='+encodeURIComponent(next||'');
const doLogout=()=>fetch('/auth/logout',{method:'POST'}).then(()=>{location.hash='#/';location.reload()});

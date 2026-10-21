require('dotenv').config();
const express=require('express'),session=require('express-session'),path=require('path'),crypto=require('crypto');
const db=require('./db'),bot=require('./bot');
const E=process.env,BASE=(E.BASE_URL||'http://localhost:3000').replace(/\/$/,'');
const app=express();app.set('trust proxy',1);
app.use(express.json({limit:'8mb'}));
app.use(session({secret:E.SESSION_SECRET||'change-me',resave:false,saveUninitialized:false,cookie:{maxAge:6048e5,sameSite:'lax',secure:'auto'}}));
const fail=(m,c=400)=>{const e=new Error(m);e.code=c;throw e};
const wrap=f=>(q,s)=>Promise.resolve().then(()=>f(q,s)).catch(e=>s.status(e.code||500).json({error:e.message}));
const me=q=>q.session.user||fail('سجّل دخولك أولاً',401);
const isAdmin=g=>g.owner||(BigInt(g.permissions)&8n);
const img=v=>{if(!v)return'';if(!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(v)||v.length>2.6e6)fail('صورة غير صالحة أو كبيرة (الحد 1.8MB)');return v};

// ---------- Discord OAuth ----------
app.get('/auth/login',(q,s)=>{q.session.next=String(q.query.next||'');q.session.st=crypto.randomBytes(8).toString('hex');
  s.redirect('https://discord.com/oauth2/authorize?'+new URLSearchParams({client_id:E.CLIENT_ID,response_type:'code',scope:'identify guilds',redirect_uri:BASE+'/auth/callback',state:q.session.st}))});
app.get('/auth/callback',wrap(async(q,s)=>{
  if(!q.query.code||q.query.state!==q.session.st)fail('طلب غير صالح');
  const t=await(await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({client_id:E.CLIENT_ID,client_secret:E.CLIENT_SECRET,grant_type:'authorization_code',code:q.query.code,redirect_uri:BASE+'/auth/callback'})})).json();
  if(!t.access_token)fail('فشل ربط الحساب');
  const H={headers:{Authorization:'Bearer '+t.access_token}};
  const u=await(await fetch('https://discord.com/api/users/@me',H)).json();
  const g=await(await fetch('https://discord.com/api/users/@me/guilds',H)).json();
  q.session.user={id:u.id,username:u.global_name||u.username,
    avatarUrl:u.avatar?`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`:'https://cdn.discordapp.com/embed/avatars/0.png',
    guilds:(Array.isArray(g)?g:[]).filter(isAdmin).map(x=>({id:x.id,name:x.name,icon:x.icon}))};
  db.user(u.id);
  const n=q.session.next||'';s.redirect('/'+(n.startsWith('#')?n:'#/stores'));
}));
app.post('/auth/logout',(q,s)=>q.session.destroy(()=>s.json({ok:1})));

// ---------- API ----------
app.get('/api/config',(q,s)=>s.json({clientId:E.CLIENT_ID}));
app.get('/api/me',(q,s)=>{const u=q.session.user;s.json(u?{id:u.id,username:u.username,avatarUrl:u.avatarUrl,isOwner:u.id===E.OWNER_ID}:null)});
app.get('/api/guilds',wrap((q,s)=>s.json(me(q).guilds.map(g=>({...g,botIn:bot.has(g.id),active:!!db.d.stores[g.id],invite:bot.invite(g.id)})))));
const own=q=>{const u=me(q),g=q.params.gid;if(!u.guilds.some(x=>x.id===g))fail('لا تملك صلاحية على هذا السيرفر',403);if(!bot.has(g))fail('البوت غير موجود في السيرفر',409);return db.store(g)};

app.get('/api/stores/:gid',wrap((q,s)=>{const st=own(q);
  s.json({...st,roles:bot.roles(q.params.gid),orders:db.d.orders.filter(o=>o.gid===q.params.gid).reverse()})}));
app.put('/api/stores/:gid/settings',wrap((q,s)=>{const st=own(q),b=q.body,o=st.settings;
  for(const k of['bank','iban','account','beneficiary'])o[k]=String(b[k]||'').slice(0,80);
  if(b.qr!==undefined)o.qr=img(b.qr);db.save();s.json(o)}));
app.post('/api/stores/:gid/products',wrap((q,s)=>{const st=own(q),b=q.body;
  if(!b.name||!(+b.price>0))fail('أدخل اسم المنتج وسعراً صحيحاً');
  const p={id:b.id||crypto.randomBytes(4).toString('hex'),name:String(b.name).slice(0,60),desc:String(b.desc||'').slice(0,500),price:+b.price,roleId:b.roleId||'',image:img(b.image)};
  const i=st.products.findIndex(x=>x.id===p.id);
  if(i<0)st.products.push(p);else{if(!p.image)p.image=st.products[i].image;st.products[i]=p}
  db.save();s.json(p)}));
app.delete('/api/stores/:gid/products/:pid',wrap((q,s)=>{const st=own(q);st.products=st.products.filter(p=>p.id!==q.params.pid);db.save();s.json({ok:1})}));
app.post('/api/stores/:gid/orders/:oid/:act',wrap(async(q,s)=>{own(q);
  const o=db.d.orders.find(x=>x.id===q.params.oid&&x.gid===q.params.gid);if(!o)fail('الطلب غير موجود',404);const a=q.params.act;
  if(a==='accept'||a==='reject'){if(o.status!=='pending')fail('حالة الطلب لا تسمح');o.status=a==='accept'?'accepted':'rejected';
    if(a==='accept'&&o.product.roleId)await bot.giveRole(o.gid,o.buyer.id,o.product.roleId).catch(()=>{o.roleErr=true});
  }else if(a==='deliver'){
    if(o.status!=='accepted')fail('اقبل الطلب أولاً');const{link,note}=q.body;if(!link&&!note)fail('أرفق رابط المنتج أو الوصف');
    const e=new bot.EmbedBuilder().setColor(0xff6a00).setTitle('📦 تم تسليم طلبك: '+o.product.name).setDescription(String(note||'').slice(0,1500)||'—');
    if(link)e.addFields({name:'رابط المنتج',value:String(link).slice(0,500)});
    await bot.dm(o.buyer.id,{embeds:[e]}).catch(()=>fail('تعذّر الإرسال: الخاص مغلق عند المشتري'));o.status='delivered';
  }else fail('إجراء غير معروف');
  db.save();s.json(o)}));

// صفحة الدفع (للمشتري فقط)
app.get('/api/order/:id',wrap((q,s)=>{const u=me(q),o=db.d.orders.find(x=>x.id===q.params.id);if(!o||o.buyer.id!==u.id)fail('الطلب غير متاح لهذا الحساب',404);
  s.json({id:o.id,status:o.status,product:o.product,pay:db.d.stores[o.gid].settings})}));
app.post('/api/order/:id/pay',wrap((q,s)=>{const u=me(q),o=db.d.orders.find(x=>x.id===q.params.id);if(!o||o.buyer.id!==u.id)fail('الطلب غير متاح',404);
  if(o.status!=='awaiting_payment')fail('تم رفع الإيصال مسبقاً');const{payer,receipt}=q.body;
  if(!payer||!receipt)fail('أدخل اسم المحوِّل وأرفق الإيصال');o.payer=String(payer).slice(0,60);o.receipt=img(receipt);o.status='pending';db.save();s.json({ok:1})}));

// لوحة مالك المنصة
app.get('/api/admin/stats',wrap((q,s)=>{if(me(q).id!==E.OWNER_ID)fail('للمالك فقط',403);
  const O=db.d.orders,by=x=>O.filter(o=>o.status===x).length;
  s.json({servers:bot.count(),stores:Object.keys(db.d.stores).length,users:Object.keys(db.d.users).length,orders:O.length,pending:by('pending'),accepted:by('accepted')+by('delivered'),delivered:by('delivered')})}));

app.use(express.static(path.join(__dirname,'..','public')));
app.listen(process.env.PORT||3000,()=>console.log('🌐 Orbit on',BASE));
bot.start().catch(e=>console.error('Bot login failed:',e.message));

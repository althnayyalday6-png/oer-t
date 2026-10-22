// تخزين JSON بسيط. للتخزين الدائم على ريندر المجاني استبدله بـ MongoDB Atlas (انظر README)
const fs=require('fs'),path=require('path');
const dir=process.env.DATA_DIR||path.join(__dirname,'..','data'),file=path.join(dir,'db.json');
fs.mkdirSync(dir,{recursive:true});
let d={stores:{},orders:[],users:{},team:[],site:{support:''}};
try{d={...d,...JSON.parse(fs.readFileSync(file,'utf8'))}}catch{}
let t;const save=()=>{clearTimeout(t);t=setTimeout(()=>fs.writeFile(file,JSON.stringify(d),()=>{}),300)};
const store=g=>{
  const s=d.stores[g]||(d.stores[g]={},save(),d.stores[g]);
  s.products??=[];
  s.ticket??={title:'🪐 الشراء الذاتي',desc:'اضغط الزر لتصفّح المنتجات واشترِ بنفسك بدون انتظار.',banner:'',btnLabel:'تصفّح المنتجات',btnEmoji:'🛒',btnStyle:'Primary',color:'#ff6a00'};
  if(!s.payments){s.payments=[];const o=s.settings; // ترحيل البيانات القديمة
    if(o&&(o.iban||o.account))s.payments.push({id:'m0',name:o.bank||'تحويل بنكي',bank:o.bank||'',beneficiary:o.beneficiary||'',iban:o.iban||'',account:o.account||'',accountOn:!!o.account,phone:'',phoneOn:false,link:'',linkOn:false,qr:o.qr||'',active:true});
    delete s.settings}
  return s};
const user=id=>{if(!d.users[id]){d.users[id]=Date.now();save()}};
module.exports={d,save,store,user};

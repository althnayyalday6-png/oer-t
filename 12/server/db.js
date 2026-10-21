// تخزين JSON بسيط. للتخزين الدائم على ريندر المجاني استبدله بـ MongoDB Atlas المجاني (انظر README)
const fs=require('fs'),path=require('path');
const dir=process.env.DATA_DIR||path.join(__dirname,'..','data'),file=path.join(dir,'db.json');
fs.mkdirSync(dir,{recursive:true});
let d={stores:{},orders:[],users:{}};
try{d={...d,...JSON.parse(fs.readFileSync(file,'utf8'))}}catch{}
let t;const save=()=>{clearTimeout(t);t=setTimeout(()=>fs.writeFile(file,JSON.stringify(d),()=>{}),300)};
const store=g=>d.stores[g]||(d.stores[g]={settings:{bank:'',iban:'',account:'',beneficiary:'',qr:''},products:[]},save(),d.stores[g]);
const user=id=>{if(!d.users[id]){d.users[id]=Date.now();save()}};
module.exports={d,save,store,user};

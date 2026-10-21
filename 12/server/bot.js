const {Client,GatewayIntentBits:G,EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle,StringSelectMenuBuilder,PermissionFlagsBits:P,SlashCommandBuilder,AttachmentBuilder}=require('discord.js');
const crypto=require('crypto'),db=require('./db');
const E=process.env,BASE=(E.BASE_URL||'').replace(/\/$/,''),COLOR=0xff6a00;
const c=new Client({intents:[G.Guilds]});
const row=(...x)=>new ActionRowBuilder().addComponents(...x);
const files=p=>{const m=/^data:image\/(\w+);base64,(.+)$/.exec(p.image||'');return m?[new AttachmentBuilder(Buffer.from(m[2],'base64'),{name:'p.'+m[1]})]:[]};

c.once('ready',async()=>{
  await c.application.commands.set([new SlashCommandBuilder().setName('setup').setDescription('نشر لوحة الشراء الذاتي في هذه الروم').setDefaultMemberPermissions(P.Administrator).setDMPermission(false)]);
  console.log('🤖 Bot ready:',c.user.tag);
});

c.on('interactionCreate',async i=>{try{
  const st=db.d.stores[i.guildId];
  if(i.isChatInputCommand()&&i.commandName==='setup'){
    if(!st)return i.reply({content:`اربط السيرفر أولاً من لوحة التحكم: ${BASE}`,ephemeral:true});
    await i.channel.send({embeds:[new EmbedBuilder().setColor(COLOR).setTitle('🪐 الشراء الذاتي').setDescription('اضغط الزر لتصفّح المنتجات واشترِ بنفسك بدون انتظار.')],
      components:[row(new ButtonBuilder().setCustomId('o_open').setLabel('تصفّح المنتجات').setStyle(ButtonStyle.Primary))]});
    return i.reply({content:'تم النشر ✅',ephemeral:true});
  }
  if(i.isButton()&&i.customId==='o_open'){
    if(!st?.products.length)return i.reply({content:'لا توجد منتجات حالياً.',ephemeral:true});
    return i.reply({ephemeral:true,content:'اختر المنتج:',components:[row(new StringSelectMenuBuilder().setCustomId('o_pick').setPlaceholder('اختر منتجاً')
      .addOptions(st.products.slice(0,25).map(p=>({label:p.name.slice(0,100),description:p.price+' ر.س',value:p.id}))))]});
  }
  if(i.isStringSelectMenu()&&i.customId==='o_pick'){
    const p=st?.products.find(x=>x.id===i.values[0]);if(!p)return i.reply({content:'المنتج غير متوفر',ephemeral:true});
    const e=new EmbedBuilder().setColor(COLOR).setTitle(p.name).setDescription(p.desc||'—').addFields({name:'السعر',value:p.price+' ر.س'});
    const f=files(p);if(f.length)e.setImage('attachment://'+f[0].name);
    return i.update({content:'',embeds:[e],files:f,components:[row(new ButtonBuilder().setCustomId('o_buy:'+p.id).setLabel('شراء الآن').setStyle(ButtonStyle.Success))]});
  }
  if(i.isButton()&&i.customId.startsWith('o_buy:')){
    const p=st?.products.find(x=>x.id===i.customId.slice(6));if(!p)return i.reply({content:'المنتج غير متوفر',ephemeral:true});
    const o={id:crypto.randomBytes(6).toString('hex'),gid:i.guildId,product:{id:p.id,name:p.name,desc:p.desc,price:p.price,roleId:p.roleId},
      buyer:{id:i.user.id,name:i.user.username},status:'awaiting_payment',created:Date.now()};
    db.d.orders.push(o);db.save();
    return i.reply({ephemeral:true,content:'طلبك جاهز ✅ أكمل الدفع من الرابط:',components:[row(new ButtonBuilder().setLabel('الذهاب للدفع').setStyle(ButtonStyle.Link).setURL(`${BASE}/#/pay/${o.id}`))]});
  }
}catch(e){console.error(e);if(!i.replied&&!i.deferred)i.reply({content:'حدث خطأ',ephemeral:true}).catch(()=>{})}});

module.exports={
  start:()=>c.login(E.BOT_TOKEN),
  has:g=>c.guilds.cache.has(g),
  count:()=>c.guilds.cache.size,
  roles:g=>[...(c.guilds.cache.get(g)?.roles.cache.values()||[])].filter(r=>!r.managed&&r.id!==g).sort((a,b)=>b.position-a.position).map(r=>({id:r.id,name:r.name})),
  giveRole:async(g,u,r)=>(await c.guilds.cache.get(g).members.fetch(u)).roles.add(r),
  dm:async(u,payload)=>(await c.users.fetch(u)).send(payload),
  invite:g=>`https://discord.com/oauth2/authorize?client_id=${E.CLIENT_ID}&scope=bot%20applications.commands&permissions=268454912&guild_id=${g}&disable_guild_select=true`,
  EmbedBuilder,
};

# Orbit — منصة الشراء الذاتي

## الهيكل
- `server/index.js` الخادم + API + ربط ديسكورد (OAuth)
- `server/bot.js` البوت (/setup، المنتجات، شراء الآن)
- `server/db.js` التخزين (ملف JSON)
- `public/` الواجهة (index.html, css/style.css, js/api.js, js/app.js)

## 1) إعداد تطبيق ديسكورد (discord.com/developers/applications)
1. New Application باسم Orbit.
2. General Information: انسخ **Application ID** (= CLIENT_ID).
3. OAuth2: انسخ **Client Secret**، وأضف Redirect: `https://اسم-تطبيقك.onrender.com/auth/callback`
4. Bot: Reset Token وانسخه (= BOT_TOKEN). لا تحتاج أي Privileged Intents.

## 2) الرفع على GitHub
ارفع محتوى المجلد (بدون node_modules و .env) إلى مستودع جديد.

## 3) ريندر
New + → Web Service → اربط المستودع. Build: `npm install` — Start: `npm start` — Plan: Free.
أضف المتغيرات: BOT_TOKEN, CLIENT_ID, CLIENT_SECRET, OWNER_ID (آيديك أنت), BASE_URL (رابط ريندر بدون / في النهاية), SESSION_SECRET (أي نص طويل).
بعد النشر ارجع لديسكورد وتأكد أن Redirect مطابق لـ BASE_URL.

## 4) الاستخدام
التاجر: يدخل الموقع ← يربط حسابه ← لوحة التحكم ← إضافة البوت ← يضيف منتجات وبيانات الدفع ← يكتب /setup في روم.
مهم: ارفع رتبة البوت فوق الرتب التي يمنحها.
مالكك: لوحة «إدارة المنصة» من قائمة الأفتار (تظهر لـ OWNER_ID فقط).

## طاقم العمل ورابط التواصل
- سجّل دخولك بحسابك (يجب أن يطابق OWNER_ID) ← قائمة الأفتار ← «إدارة المنصة» ← «إضافة حسابي». يظهر يوزرك وأفتارك تلقائياً في صفحة «طاقم العمل»، ويتحدث الأفتار عند كل دخول.
- لإضافة عضو آخر ضع آيديه (Developer Mode ← كليك يمين على الحساب ← Copy User ID) وسيجلب البوت اسمه وصورته.
- رابط ديسكورد في أسفل الموقع: من نفس صفحة «إدارة المنصة» (أو متغير SUPPORT_URL).

## ملاحظات الخطة المجانية
- ريندر المجاني ينام بعد 15 دقيقة بدون زيارات (البوت يتوقف). استخدم UptimeRobot مجاناً لمراقبة رابط الموقع كل 5 دقائق.
- القرص مؤقت: ملف db.json يُمسح عند كل نشر/إعادة تشغيل. للتخزين الدائم المجاني استبدل `server/db.js` بـ MongoDB Atlas (M0 مجاني) أو أضف Render Disk (مدفوع).

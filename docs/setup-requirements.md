# متطلبات تشغيل الفرونت إند — HumaScale

## المطلوب
- Node.js 18+
- npm
- الباك إند يعمل على المنفذ 8000

## الإعداد

```bash
copy .env.example .env
npm install
npm run dev
```

افتح:

`http://localhost:5173`

## متغيرات مهمة في `.env`
- `VITE_API_BASE_URL` اتركه فارغاً في التطوير (يستخدم proxy)
- `VITE_REVERB_APP_KEY` و`VITE_REVERB_HOST` و`VITE_REVERB_PORT` و`VITE_REVERB_SCHEME` يجب أن تطابق الباك إند

## صفحات جديدة
- `/chat` دردشة المجتمع
- `/project-review` تقييم مشروع + حجز نقطة
- `/expansion` خريطة المشاريع
- `/admin/settings` مفتاح Gemini وروابط التواصل
- `/admin/community-chat` دردشة المجتمع للإدارة

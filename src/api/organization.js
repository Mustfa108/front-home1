import { userApi } from './client';

export const organizationApi = {
  show: () => userApi.get('/profile/organization').then((r) => r.data),
  update: (payload) =>
    userApi.patch('/profile/organization', payload).then((r) => r.data),
};

export const ORG_TYPES = [
  { value: 'civil_society', labelAr: 'منظمة مجتمع مدني' },
  { value: 'volunteer_team', labelAr: 'فريق تطوعي' },
  { value: 'startup', labelAr: 'مشروع ناشئ' },
  { value: 'other', labelAr: 'أخرى' },
];

export const ORG_SIZES = [
  { value: 'small', labelAr: 'صغيرة' },
  { value: 'medium', labelAr: 'متوسطة' },
  { value: 'large', labelAr: 'كبيرة' },
];

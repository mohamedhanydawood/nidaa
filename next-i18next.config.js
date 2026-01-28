module.exports = {
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
  },
  defaultNS: 'common',
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

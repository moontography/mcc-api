const appName = process.env.APP_NAME || "moontography-api";

export default {
  app: {
    name: appName,
  },

  server: {
    // isProduction: process.env.NODE_ENV === 'production',
    port: process.env.PORT || 8080,
  },
};

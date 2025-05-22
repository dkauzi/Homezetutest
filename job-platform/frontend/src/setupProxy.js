// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: "https://dhnveaaocdgibcxgbsaj.supabase.co",
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/api': '/rest/v1',
      },
    })
  );
};
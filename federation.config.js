const {
  withNativeFederation,
  shareAll,
} = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'shell',

  /**
   * Modules exposed to every domain portal.
   *
   * Norma 5.4.1: the portal must NOT implement its own HTTP client or session.
   * Both are imported from here as `shell/apiClient` and `shell/session`.
   */
  exposes: {
    './apiClient': './src/app/core/http/api-client.service.ts',
    './apiError': './src/app/core/http/api-error.ts',
    './session': './src/app/core/auth/session.service.ts',
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],
});
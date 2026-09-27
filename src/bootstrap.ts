import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json')
  .catch((err) => console.error('Federation init failed', err))
  .then(() => import('./main').then((m) => m));
// Native Federation workaround: define ngDevMode globally before any
// shared Angular package runs. Without this, services constructed by
// the remote's federation runtime throw "ngDevMode is not defined".
(globalThis as unknown as { ngDevMode: boolean }).ngDevMode = false;

import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json')
  .catch((err) => console.error('Federation init failed', err))
  .then(() => import('./main').then((m) => m));

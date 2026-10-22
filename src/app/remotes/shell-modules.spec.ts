import { describe, expect, it } from 'vitest';

import manifest from '../../../public/federation.manifest.json';

describe('shell modules for portals', () => {
  // Native Federation only adds import-map entries for remotes listed in the
  // manifest; without this one, `shell/apiClient`, `shell/session` and
  // `shell/apiError` cannot be resolved by any portal.
  it('lists the shell itself so portals can import shell/*', () => {
    expect((manifest as Record<string, string>)['shell']).toBe('http://localhost:4200/remoteEntry.json');
  });
});

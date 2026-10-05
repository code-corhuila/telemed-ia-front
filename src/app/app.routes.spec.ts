import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('Front routes', () => {
  it('registers the Intelligent Agent route inside the authenticated shell', () => {
    const shellRoute = routes.find((route) => route.path === '');

    expect(shellRoute).toBeTruthy();
    expect(shellRoute?.canActivate).toBeTruthy();

    const agentRoute = shellRoute?.children?.find(
      (route) => route.path === 'agent',
    );

    expect(agentRoute).toBeTruthy();
  });
});
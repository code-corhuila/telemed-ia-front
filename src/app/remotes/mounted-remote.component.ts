import { loadRemoteModule } from '@angular-architects/native-federation';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SHELL_BRIDGE, ShellBridge } from '../core/bridge/shell-bridge';
import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/** What a portal that is not written in Angular exposes as `./mount`. */
interface MountableRemote {
  mount(element: HTMLElement, bridge: ShellBridge): () => void;
}

/**
 * Hosts a non-Angular portal (route data `remoteName`): mounts it in this
 * page with the shell bridge and unmounts it when the page goes away.
 *
 * If the remote is unavailable, only this section displays the fallback;
 * the rest of the shell remains available.
 */
@Component({
  selector: 'app-mounted-remote',
  standalone: true,
  imports: [RemoteUnavailableComponent],
  template: `
    @if (unavailable()) {
      <app-remote-unavailable />
    }
    <div #host></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MountedRemoteComponent implements AfterViewInit {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly remoteName: string = inject(ActivatedRoute).snapshot.data['remoteName'];
  private readonly bridge = inject(SHELL_BRIDGE);
  private unmount: (() => void) | undefined;
  private destroyed = false;

  readonly unavailable = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.unmount?.();
    });
  }

  ngAfterViewInit(): void {
    loadRemoteModule<Partial<MountableRemote>>({
      remoteName: this.remoteName,
      exposedModule: './mount',
    })
      .then((remote) => {
        if (this.destroyed) {
          return;
        }
        if (typeof remote.mount !== 'function') {
          throw new Error(`${this.remoteName} does not expose mount`);
        }
        this.unmount = remote.mount(this.host().nativeElement, this.bridge);
      })
      .catch(() => {
        if (!this.destroyed) {
          this.unavailable.set(true);
        }
      });
  }
}

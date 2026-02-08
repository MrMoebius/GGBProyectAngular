import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from './public-navbar.component';
import { PublicFooterComponent } from './public-footer.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent, PublicFooterComponent, ToastComponent],
  template: `
    <app-public-navbar />
    <main class="public-main">
      <router-outlet />
    </main>
    <app-public-footer />
    <app-toast />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--content-bg);
    }

    .public-main {
      flex: 1;
      margin-top: var(--public-nav-height);
    }
  `]
})
export class PublicLayoutComponent {}

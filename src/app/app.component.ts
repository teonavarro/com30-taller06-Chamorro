import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
      <nav style="margin-bottom: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px;">
        <a
          routerLink="/reservas"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          style="margin-right: 16px; text-decoration: none; color: #1e293b; font-weight: 600;"
        >Reservas</a>
        <a
          routerLink="/reservas/nueva"
          routerLinkActive="active"
          style="margin-right: 16px; text-decoration: none; color: #1e293b; font-weight: 600;"
        >Nueva Reserva</a>
        <a
          routerLink="/estadisticas"
          routerLinkActive="active"
          style="text-decoration: none; color: #1e293b; font-weight: 600;"
        >Estadísticas</a>
      </nav>
      <router-outlet />
    </div>
  `
})
export class AppComponent {}

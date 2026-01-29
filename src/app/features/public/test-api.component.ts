import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-api',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border rounded shadow-sm my-4">
      <h3 class="text-lg font-bold mb-2">Test de Integración API</h3>
      <div class="flex gap-2 mb-4">
        <button (click)="testApi()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Probar GET /api/juegos
        </button>
        <button (click)="clearToken()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Borrar Token (Logout forzado)
        </button>
      </div>

      <div *ngIf="result" [ngClass]="{'text-green-600': success, 'text-red-600': !success}" class="p-2 bg-gray-100 rounded">
        <strong>Resultado:</strong> {{ result }}
      </div>
    </div>
  `
})
export class TestApiComponent {
  private http = inject(HttpClient);
  result: string = '';
  success: boolean = false;

  testApi() {
    this.result = 'Cargando...';
    this.http.get('/api/juegos').subscribe({
      next: (data) => {
        this.success = true;
        this.result = 'Éxito: ' + JSON.stringify(data).substring(0, 100) + '...';
        console.log('API Response:', data);
      },
      error: (err) => {
        this.success = false;
        this.result = `Error ${err.status}: ${err.statusText}`;
        console.error('API Error:', err);
      }
    });
  }

  clearToken() {
    localStorage.removeItem('token');
    this.result = 'Token eliminado. Intenta probar la API de nuevo (debería dar 401).';
    this.success = true;
  }
}

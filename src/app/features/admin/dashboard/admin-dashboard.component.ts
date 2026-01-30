import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { JuegoService } from '../../../core/services/juego.service';
import { Juego } from '../../../core/models/juego.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Inventario de Juegos</h1>
          <p class="text-sm text-gray-500 mt-1">
            Administrador: <strong>{{ authService.currentUser()?.email || 'Usuario' }}</strong>
          </p>
        </div>
        <button
          (click)="openModal()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Juego
        </button>
      </div>

      <!-- Tabla de Juegos -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugadores</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complejidad</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (juego of juegos(); track juego.id) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ juego.nombre }}</div>
                  <div class="text-xs text-gray-500">{{ juego.genero }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ juego.minJugadores }} - {{ juego.maxJugadores }}
                  <span *ngIf="juego.recomendadoDosJugadores" class="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">2P Rec.</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800': juego.complejidad === 'BAJA',
                      'bg-yellow-100 text-yellow-800': juego.complejidad === 'MEDIA',
                      'bg-red-100 text-red-800': juego.complejidad === 'ALTA'
                    }">
                    {{ juego.complejidad || 'N/A' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ juego.ubicacion || 'Sin asignar' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="juego.activo ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'">
                    {{ juego.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="editJuego(juego)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button (click)="deleteJuego(juego.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                  No hay juegos registrados. ¡Añade el primero!
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div *ngIf="showModal()" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ isEditing() ? 'Editar Juego' : 'Nuevo Juego' }}
          </h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <form [formGroup]="juegoForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Nombre del Juego</label>
                <input type="text" formControlName="nombre" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                <p *ngIf="isFieldInvalid('nombre')" class="text-red-500 text-xs mt-1">El nombre es obligatorio</p>
              </div>

              <!-- Jugadores -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Mín. Jugadores</label>
                <input type="number" formControlName="minJugadores" min="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Máx. Jugadores</label>
                <input type="number" formControlName="maxJugadores" min="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
              </div>
              <p *ngIf="juegoForm.errors?.['invalidRange']" class="col-span-2 text-red-500 text-xs">El mínimo de jugadores no puede ser mayor que el máximo.</p>

              <!-- Duración y Complejidad -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Duración (min)</label>
                <input type="number" formControlName="duracionMediaMin" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Complejidad</label>
                <select formControlName="complejidad" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>

              <!-- Género (Checkboxes) -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Géneros</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
                  @for (genero of availableGeneros; track genero) {
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="isGeneroSelected(genero)"
                        (change)="onGeneroChange($event, genero)"
                        class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                      <span class="text-sm text-gray-700">{{ genero }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Idioma -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Idioma</label>
                <select formControlName="idioma" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Alemán">Alemán</option>
                  <option value="Francés">Francés</option>
                  <option value="Independiente del idioma">Independiente del idioma</option>
                </select>
              </div>

              <!-- Ubicación -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                <select formControlName="ubicacion" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="">Seleccionar ubicación</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Pasillo">Pasillo</option>
                  <option value="Salón">Salón</option>
                  <option value="Almacén">Almacén</option>
                  <option value="Mostrador">Mostrador</option>
                </select>
              </div>

              <!-- Checkboxes -->
              <div class="col-span-2 flex gap-6 mt-2">
                <label class="inline-flex items-center">
                  <input type="checkbox" formControlName="recomendadoDosJugadores" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Recomendado 2 Jugadores</span>
                </label>
                <label class="inline-flex items-center">
                  <input type="checkbox" formControlName="activo" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Activo</span>
                </label>
              </div>

              <!-- Descripción -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea formControlName="descripcion" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button type="button" (click)="closeModal()" class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm font-medium">
                Cancelar
              </button>
              <button type="submit" [disabled]="juegoForm.invalid" class="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                {{ isEditing() ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  juegoService = inject(JuegoService);
  fb = inject(FormBuilder);

  juegos = signal<Juego[]>([]);
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentJuegoId: number | null = null;

  availableGeneros = [
    'Acción', 'Aventura', 'Familiar', 'Carreras', 'Estrategia',
    'Rol', 'Misterio', 'Cartas', 'Party', 'Infantil', 'Cooperativo', 'Puzzle'
  ];

  juegoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    minJugadores: [1, [Validators.required, Validators.min(1)]],
    maxJugadores: [4, [Validators.required, Validators.min(1)]],
    duracionMediaMin: [30, [Validators.min(1)]],
    complejidad: ['MEDIA'],
    genero: [[]], // Array interno para lógica
    idioma: ['Español'],
    descripcion: [''],
    ubicacion: [''],
    recomendadoDosJugadores: [false],
    activo: [true]
  }, { validators: this.minMaxValidator });

  ngOnInit() {
    this.loadJuegos();
  }

  loadJuegos() {
    this.juegoService.getJuegos().subscribe({
      next: (data) => {
        console.log('Juegos cargados:', data);
        this.juegos.set(data);
      },
      error: (err) => console.error('Error cargando juegos', err)
    });
  }

  openModal() {
    this.isEditing.set(false);
    this.currentJuegoId = null;
    this.juegoForm.reset({
      minJugadores: 1,
      maxJugadores: 4,
      duracionMediaMin: 30,
      complejidad: 'MEDIA',
      idioma: 'Español',
      activo: true,
      recomendadoDosJugadores: false,
      genero: []
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  editJuego(juego: Juego) {
    this.isEditing.set(true);
    this.currentJuegoId = juego.id;

    // Convertir string de géneros a array si es necesario
    let generos: string[] = [];
    if (juego.genero) {
      generos = Array.isArray(juego.genero) ? juego.genero : juego.genero.split(',').map(g => g.trim());
    }

    this.juegoForm.patchValue({
      ...juego,
      genero: generos
    });
    this.showModal.set(true);
  }

  deleteJuego(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este juego?')) {
      this.juegoService.deleteJuego(id).subscribe({
        next: () => this.loadJuegos(),
        error: (err) => console.error('Error eliminando juego', err)
      });
    }
  }

  // Manejo manual de checkboxes para géneros
  onGeneroChange(event: any, genero: string) {
    const currentGeneros = this.juegoForm.get('genero')?.value || [];
    if (event.target.checked) {
      this.juegoForm.patchValue({ genero: [...currentGeneros, genero] });
    } else {
      this.juegoForm.patchValue({ genero: currentGeneros.filter((g: string) => g !== genero) });
    }
  }

  isGeneroSelected(genero: string): boolean {
    const currentGeneros = this.juegoForm.get('genero')?.value || [];
    return currentGeneros.includes(genero);
  }

  onSubmit() {
    if (this.juegoForm.invalid) {
      this.juegoForm.markAllAsTouched();
      return;
    }

    const formValue = this.juegoForm.value;

    // Convertir array de géneros a string separado por comas para el backend
    const juegoData = {
      ...formValue,
      genero: Array.isArray(formValue.genero) ? formValue.genero.join(', ') : formValue.genero
    };

    console.log('Enviando datos:', juegoData);

    if (this.isEditing() && this.currentJuegoId) {
      this.juegoService.updateJuego(this.currentJuegoId, juegoData).subscribe({
        next: () => {
          this.loadJuegos();
          this.closeModal();
        },
        error: (err) => console.error('Error actualizando juego', err)
      });
    } else {
      this.juegoService.saveJuego(juegoData).subscribe({
        next: () => {
          this.loadJuegos();
          this.closeModal();
        },
        error: (err) => console.error('Error guardando juego', err)
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.juegoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  minMaxValidator(group: FormGroup) {
    const min = group.get('minJugadores')?.value;
    const max = group.get('maxJugadores')?.value;
    return min && max && min > max ? { invalidRange: true } : null;
  }
}

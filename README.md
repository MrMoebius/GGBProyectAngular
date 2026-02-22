# GGBProyect - Frontend

Aplicacion web para **GGBar** (Giber Games Bar), desarrollada en Angular 17. Interfaz para clientes (reservas, sesion en mesa, eventos), empleados (gestion de sala, comandas) y administracion (CRUD completo de todas las entidades).

## Tecnologias

- **Angular 17.3** (Standalone Components, Signals, lazy-loaded routes)
- **CSS Variables** con dark mode (`[data-theme="dark"]`)
- **FontAwesome** para iconografia
- **RxJS** (forkJoin, concatMap, signals para estado)

## Estructura

```
src/app/
  core/
    services/     24 servicios (ApiService, AuthService, ComandaService, etc.)
    models/       21 interfaces TypeScript
    guards/       role.guard.ts (CanActivateFn, JWT role check)
    interceptors/ auth.interceptor.ts (Bearer token)
  features/
    auth/         Login, registro, verificacion email, recuperacion password
    public/       Landing, catalogo juegos, carta, eventos, reservas
    customer/     Dashboard, mi sesion (comandas), notificaciones, facturas
    staff/        Dashboard empleado, gestion sala (reutiliza componentes admin)
    admin/        CRUD: juegos, productos, mesas, sesiones, comandas, empleados,
                  clientes, reservas, eventos, facturas
  shared/
    components/   beer-loader, confirm-modal, entity-form-modal, game-card,
                  status-badge, table-map, toast, skeleton
```

## Funcionalidades principales

| Area         | Funcionalidades                                                                                                                           |
|--------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Publica**  | Landing, catalogo de juegos con filtros, carta de productos, listado de eventos con inscripcion, formulario de reservas                   |
| **Cliente**  | Dashboard (sesion activa, proximos eventos, reservas), gestion de comandas en tiempo real, historial de facturas con detalle de productos |
| **Empleado** | Dashboard con resumen del dia, mapa de mesas interactivo, gestion de comandas (confirmar, preparar, servir), reservas                     |
| **Admin**    | CRUD completo de todas las entidades, gestion de imagenes (juegos, eventos, clientes), estadisticas                                       |

## Patrones

- `signal<T>()` para estado local, `computed()` para derivados
- `ApiService` centralizado: `getAll()` extrae `.content` de respuestas paginadas Spring
- Inline templates y estilos en componentes (no archivos separados .html/.css)
- `ToastService` para notificaciones
- `BeerLoaderComponent` para estados de carga

## Configuracion

```bash
npm install
ng serve
```

Se inicia en `http://localhost:4200` con proxy a `http://localhost:8080` para la API.

## Despliegue

El build de produccion se sirve como archivos estaticos via nginx en Raspberry Pi 5.

```bash
ng build --configuration=production
```

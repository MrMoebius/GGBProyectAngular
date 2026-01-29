# GGBProyect - Frontend

Frontend desarrollado en Angular 17+ para el sistema de gestión de local de juegos de mesa y restauración "GGBProyect".

## Estructura del Proyecto

El proyecto sigue una arquitectura modular con carga perezosa (Lazy Loading) y Standalone Components.

### Módulos Principales (Features)

*   **auth/**: Gestión de autenticación (Login, Registro).
*   **public/**: Área pública accesible sin login (Landing, Catálogo, Carta).
*   **customer/**: Área privada para clientes (Dashboard, Sesión en mesa, Historial).
*   **staff/**: Área para empleados (Gestión de sala, TPV, Ludoteca).
*   **admin/**: Área de administración (Inventario, Personal, Configuración).

### Core & Shared

*   **core/**: Servicios singleton, modelos de datos (interfaces), guards e interceptores.
*   **shared/**: Componentes reutilizables (UI Kit), pipes y directivas comunes.

## Flujos de Trabajo Clave

### 1. QR -> Sesión -> Pago (Cliente)

1.  El cliente escanea un código QR en la mesa.
2.  Accede a la ruta `/customer/live-session/:tableId`.
3.  Si no está logueado, se redirige a `/auth/login` y luego vuelve a la sesión.
4.  En la vista "Live Session", puede ver el estado de su mesa, añadir productos al carrito (Comanda) y solicitar la cuenta.

### 2. Gestión de Sala (Empleado)

1.  El empleado accede a `/staff/sala`.
2.  Visualiza un mapa de mesas con indicadores de estado (Libre, Ocupada, Reservada).
3.  Puede abrir mesas, asignar clientes y gestionar pedidos.

## Roles de Usuario

*   **CLIENTE**: Acceso a su perfil, historial y sesión activa en mesa.
*   **EMPLEADO**: Acceso a TPV, gestión de sala y ludoteca.
*   **ADMIN**: Acceso total, incluyendo configuración y gestión de personal.

## Tecnologías

*   **Angular 17+**: Framework principal (Standalone Components, Signals).
*   **Tailwind CSS**: Framework de estilos utility-first.
*   **FontAwesome**: Iconografía.

## Configuración de Desarrollo

1.  Instalar dependencias: `npm install`
2.  Iniciar servidor de desarrollo: `ng serve`
3.  Acceder a `http://localhost:4200`

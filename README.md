# TechnoLoad WebApp

Aplicación operativa para la gestión de flota, mantenimiento y despachos de TechnoLoad. Es una demostración funcional en JavaScript puro y almacena los cambios de prueba en `localStorage`.

## Módulos funcionales

- **Dashboard:** indicadores de activos, disponibilidad, alertas y despachos activos.
- **Flota:** registrar, editar, buscar, filtrar y dar de baja activos.
- **Mantenimiento:** programar y completar intervenciones preventivas.
- **Operaciones:** crear despachos e iniciar rutas, reservando la unidad disponible.

## Despliegue en Azure Static Web Apps

1. Crea un repositorio llamado `technoload-webapp` y sube el contenido de esta carpeta.
2. En Azure Portal, crea un recurso **Azure Static Web Apps** conectado al repositorio.
3. Elige **Custom** y configura `App location` como `/`.
4. Deja vacíos `Api location` y `Output location`; la aplicación no requiere build.
5. Haz push a `main` después de autorizar el workflow generado por Azure.

> La versión entregada es autosuficiente para demostración. Para producción, conecta sus acciones al API publicado de `technoload-platform` y añade autenticación.

## Variables de entorno

- `.env.development` documenta la API local: `http://localhost:8080/api/v1`.
- `.env.production` contiene el lugar donde debes colocar la URL de tu App Service: `https://TU-APP-SERVICE.azurewebsites.net/api/v1`.

Como esta entrega es JavaScript estático sin proceso de compilación, Azure no inyecta por sí mismo variables `VITE_*` al navegador. Los archivos se incluyen para cumplir la configuración de entornos solicitada y para una futura migración a Vite; tras publicar el backend, reemplaza el placeholder por la URL real antes del commit de producción. No guardes claves, tokens ni contraseñas en archivos `.env` que vayan a GitHub.

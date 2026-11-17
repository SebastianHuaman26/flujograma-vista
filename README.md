# Flujograma Archivo UPCH

Mapa interactivo de los siete procesos del Área de Archivo de la Universidad Peruana Cayetano Heredia. Incluye responsables, sistemas, rutas de decisión, proyectos, filtros y detalles de los pasos.

HTML5, CSS3 y JavaScript con ES Modules nativos. No requiere compilación ni dependencias de producción. Conserva las fuentes de Google Fonts e iconos de Font Awesome mediante los enlaces CDN originales.

## Ejecutar localmente (Windows o Linux)

Con Git y Python instalados:

```sh
git clone https://github.com/SebastianHuaman26/flujograma-vista.git
cd flujograma-vista
git switch fix
python -m http.server 8000
```

Abrir http://localhost:8000. Es necesario servir por HTTP: abrir `index.html` directamente con `file://` no permite cargar módulos en los navegadores habituales.

## Arquitectura

```text
index.html                   Estructura semántica y plantillas de diálogos
styles.css                   Manifest de imports CSS en el orden original
css/
  base.css                   Variables, reset, tipografía y estilos globales
  components.css             Componentes originales anteriores a media queries
  responsive.css             Adaptación y movimiento reducido originales
  print.css                  Reglas de impresión
  components-overrides.css   Reglas originales posteriores a impresión
  responsive-projects.css    Media query posterior de proyectos
  inventory.css              Últimas reglas originales de inventarios
js/
  app.js                     Inicialización y composición
  data/
    people.js                Personas, roles, colores y descripciones
    systems.js               Sistemas documentales
    flows.js                 Procesos, siete flujos y bloque FAENF compartido
    catalog.js               Índice de pasos y contadores derivados
  components/
    visuals.js               Avatares, sistemas y estados reutilizables
    step-card.js             Pasos, secuencias, bifurcaciones y cobertura
    digitacion.js            Líneas y tarjetas de digitación
    project-card.js          Proyectos, avance y bloques relacionados
    flow-card.js             Composición de tarjetas de flujo
    team-card.js             Equipo, KPI y sistemas del pie
    dialog.js                Detalles, diálogo de sistemas y foco
  services/
    filters.js               Estado, lógica, menús y eventos de filtros
    navigation.js            Índice, enlaces, desplazamiento y expansión
    print.js                 Impresión y restauración del estado de apertura
  utils/
    helpers.js               Escape HTML y formato numérico
    dom.js                   Consultas DOM
tests/
  data.test.js               Integridad y combinaciones de filtros
  browser.mjs                Regresión funcional y comparación opcional
```

Los tres archivos CSS adicionales conservan el orden efectivo de las reglas del archivo original, que contiene ajustes de componentes después de las reglas responsive y de impresión. No se han adelantado ni agrupado esos ajustes: cambiar el orden de los imports puede modificar la cascada. Los módulos de renderizado conservan las plantillas originales; los datos no dependen del DOM ni de los servicios.

## Modificar datos

Editar el objeto correspondiente en `js/data/flows.js`, manteniendo identificadores de pasos, relaciones y referencias. FAENF reutiliza `FAENF_SILABOS_LANE`; modificar ese bloque compartido en lugar de copiarlo.

Para agregar un flujo, añadir su definición a `FLOWS`, asignar un número e identificadores de pasos únicos, registrar su grupo en `PROCESS_OPTIONS` y usar personas y sistemas existentes. `catalog.js` deriva el índice y los contadores automáticamente. Los textos estáticos de `index.html` que mencionen cantidades deben revisarse al ampliar el mapa.

Para agregar responsables o sistemas, ampliar `people.js` o `systems.js` con las mismas propiedades que las entradas existentes y referenciarlos por su clave en los flujos. No incluir HTML sin escapar en los datos. La huella de regresión debe actualizarse conscientemente solo cuando se autorice modificar información.

## GitHub Pages

En GitHub, abrir **Settings → Pages → Build and deployment → Deploy from a branch** y seleccionar la rama que se desee publicar con carpeta `/ (root)`. Para revisar esta refactorización de forma independiente, seleccionar `fix`. Se conserva `.nojekyll` y todas las referencias locales son relativas, compatibles con `/<nombre-del-repositorio>/`. Publicar `fix` cambia el contenido del sitio configurado: no es necesario hacerlo para revisar el código de la rama.

## Pruebas

Node.js 22 o posterior para las pruebas de datos, sin instalar paquetes:

```sh
npm test
```

Comprueban siete flujos, unicidad y referencias de pasos, catálogos, todas las combinaciones individuales de proceso/persona/sistema y una huella SHA-256 de todos los datos originales.

Para pruebas en navegador, instalar dependencias de desarrollo:

```sh
npm ci
npx playwright install chromium
python -m http.server 8000
```

En otra terminal PowerShell:

```powershell
$env:APP_URL = "http://127.0.0.1:8000/"
$env:CHROMIUM_PATH = "C:\ruta\a\chrome.exe"
npm run test:browser
```

En Linux, el ejecutable predeterminado es `/usr/bin/chromium`. Se puede indicar cualquier ejecutable Chromium compatible con `CHROMIUM_PATH`.

`BASELINE_URL` permite comparar con una copia original servida por HTTP en el mismo servidor. Las pruebas verifican DOM, geometría, estilos computados y capturas completas en 1440×900, 1024×768, 768×1024 y 390×844; después verifican tarjetas, filtros, equipo, diálogos, navegación horizontal, expansión y ciclo de impresión. Las capturas y PDF se guardan en `test-results/`, excluido de Git.

La comparación bloquea recursos externos para ser reproducible y utiliza las fuentes locales de respaldo; no comprueba disponibilidad de los CDN ni permisos de Google Sheets/Drive/Slides. Sus URLs originales se conservan en los datos y en el HTML. La exportación PDF se verifica con Chromium; la configuración del cuadro de impresión del sistema depende del navegador.

## Verificación de esta refactorización

Ejecutada el 17/11/2026 en la rama `fix`:

- `npm test`: 3 pruebas aprobadas, incluyendo 288 combinaciones de filtros y la huella íntegra de los datos originales.
- Comparación contra una copia de `main` anterior a los cambios: DOM generado, geometría, estilos computados y capturas PNG idénticos en las cuatro dimensiones indicadas.
- Chromium: 48 tarjetas de pasos abren sus detalles; filtros por proceso y equipo, limpieza, diálogo de sistemas, navegación, desplazamiento horizontal y expansión/contracción verificados.
- Ciclo `beforeprint`/`afterprint`: apertura y restauración verificadas; PDF generado. Las reglas CSS conservan exactamente el orden y contenido del original, también para impresión.
- Sin excepciones JavaScript ni respuestas HTTP de error para recursos de la aplicación durante las pruebas. Aplicación servida bajo un subdirectorio, sin compilación.

La comparación visual usa recursos locales de respaldo según se describe arriba; no se han probado los permisos o la disponibilidad de los documentos externos ni el cuadro de impresión de Windows.

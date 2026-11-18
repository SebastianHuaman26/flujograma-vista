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

Comprueban siete flujos, unicidad y referencias de pasos, catálogos, todas las combinaciones individuales de proceso/persona/sistema y huellas SHA-256 de los contenidos conservados, además de las novedades autorizadas del Plan 2027, organigrama y Proyecto 01.

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

`BASELINE_URL` permite comparar con una copia original servida por HTTP en el mismo servidor. Las pruebas comparan DOM, geometría, estilos computados y capturas de los flujos protegidos en 1440×900, 1024×768, 768×1024 y 390×844; después verifican tarjetas, filtros, equipo, diálogos, navegación horizontal, expansión y ciclo de impresión. Las capturas y PDF se guardan en `test-results/`, excluido de Git.

La comparación bloquea recursos externos para ser reproducible y utiliza las fuentes locales de respaldo; no comprueba disponibilidad de los CDN ni permisos de Google Sheets/Drive/Slides. Sus URLs originales se conservan en los datos y en el HTML. La exportación PDF se verifica con Chromium; la configuración del cuadro de impresión del sistema depende del navegador.

## Verificación de la refactorización anterior (17/11/2026)

Ejecutada el 17/11/2026 en la rama `fix`:

- `npm test`: 3 pruebas aprobadas, incluyendo 288 combinaciones de filtros y la huella íntegra de los datos originales.
- Comparación contra una copia de `main` anterior a los cambios: DOM generado, geometría, estilos computados y capturas PNG idénticos en las cuatro dimensiones indicadas.
- Chromium: 48 tarjetas de pasos abren sus detalles; filtros por proceso y equipo, limpieza, diálogo de sistemas, navegación, desplazamiento horizontal y expansión/contracción verificados.
- Ciclo `beforeprint`/`afterprint`: apertura y restauración verificadas; PDF generado. Las reglas CSS conservan exactamente el orden y contenido del original, también para impresión.
- Sin excepciones JavaScript ni respuestas HTTP de error para recursos de la aplicación durante las pruebas. Aplicación servida bajo un subdirectorio, sin compilación.

La comparación visual usa recursos locales de respaldo según se describe arriba; no se han probado los permisos o la disponibilidad de los documentos externos ni el cuadro de impresión de Windows.

## Actualización de contenido · noviembre 2026

El **Organigrama funcional** se incorpora dentro de Equipo de archivo, después de las tarjetas personales. Representa Secretaría Académica → Supervisor de Archivo → Auxiliar de Archivo y Digitadores Archivo FAMEE. Los cargos no se asignan a personas: los paneles expandibles contienen las funciones del documento y se incluyen en impresión.

El **Plan de Trabajo 2027**, entre el mapa y el equipo, contiene seis actividades independientes, sus volúmenes, recursos, productividad y fechas estimadas. No constituye un octavo flujo ni modifica los proyectos del flujo 07. Sus periodos son programación, no porcentajes de avance. Los datos son estáticos: no se actualizan automáticamente ni se recalculan las fechas a partir de la productividad.

Terminología: FAMED = Facultad de Medicina; FAENF = Facultad de Enfermería; FAEST = Facultad de Estomatología; FAMEE = Facultades Integradas. **FAEN se conserva literalmente como aparece en el plan; no se ha confirmado su equivalencia con FAENF.** Las productividades indicadas en hojas/mes se conservan aunque el volumen se exprese en expedientes. La capacitación no incluye una cantidad ni nombres de responsables: solo se indica Personal de Archivo.

El Proyecto 01 de Resoluciones Académicas está **Finalizado al 100 %**, por confirmación expresa. Se conservan como historial sus pasos y reportes parciales de 50 %, 15 % y 25 %. No se declara fecha exacta de cierre, cantidades definitivas ni cierre individual de tareas sin evidencia. El Proyecto 02 conserva íntegramente sus datos y estado.

Módulos añadidos:

- `js/data/organization.js` y `js/components/organization.js`: cargos, funciones y jerarquía.
- `js/data/plan-2027.js` y `js/components/plan-2027.js`: programación y tarjetas del plan.
- `css/organization.css`, `css/plan-2027.css` y `css/project-completion.css`: estilos específicos, responsive e impresión, importados después de los estilos originales.

Para actualizar estos contenidos, editar sus módulos de datos y contrastar las cifras con la fuente autorizada. No identificar FAEN con FAENF, asignar personas a recursos anónimos ni convertir metas en avances reales. Los botones «Ver organigrama» y «Ver plan 2027» enlazan a los documentos proporcionados; «Ver presentación» conserva su URL original.

### Protección y regresión

Los flujos **02, 04 y 06 tienen protección de contenido y no fueron modificados**. Se conservan el bloque compartido FAENF, los datos de Yesely Rafael y Lucero Garcia y sus componentes, diálogos, filtros e impresión. Las novedades del plan se mantienen separadas.

La referencia previa es el commit `99930cc`. `tests/fixtures/preserved.json` registra huellas SHA-256 de los flujos 01–06 completos, personas, sistemas, opciones de procesos, FAENF, los pasos históricos del flujo 07, el Proyecto 02 y el enlace de presentación. La prueba original de huella global se reemplaza por estas comprobaciones específicas y por pruebas del cierre autorizado, las seis actividades y la jerarquía; no se elimina la protección de integridad.

Para comparar visualmente, servir una copia del commit anterior junto con la aplicación y establecer `BASELINE_URL`. La prueba compara DOM, geometría relativa, estilos y capturas de los flujos 02, 04 y 06 en las cuatro resoluciones, y sus estilos/contenido de impresión. También comprueba seis tarjetas nuevas, cargos, enlaces y acceso mediante teclado, ausencia de desbordamiento horizontal, diálogos, filtros y PDF. Los CDN se bloquean para comparar con fuentes de respaldo de forma reproducible; no se verifican los permisos de acceso de Google a los documentos externos.

### Resultados de la actualización (18/11/2026)

- `npm test`: 6 pruebas aprobadas, con integridad de los contenidos protegidos, 288 combinaciones de filtros, jerarquía, fechas/cifras del plan y cierre del Proyecto 01.
- `BASELINE_URL=http://127.0.0.1:8000/work/update-baseline/ npm run test:browser`: aprobado en Chromium. Comparación de los tres flujos protegidos en 1440×900, 1024×768, 768×1024 y 390×844; HTML, geometría y estilos coincidentes. Las capturas permiten una diferencia máxima de 3/255 por canal para redondeos de rasterizado, sin tolerancia en datos ni estilos.
- Verificadas 48 tarjetas de pasos, diálogos, filtros individuales y selección múltiple combinada, equipo, enlaces de navegación, desplazamiento horizontal, expansión/contracción y ciclo de impresión/restauración. Sin excepciones JavaScript ni recursos locales con HTTP de error.
- PDF generado y texto extraído comprobado: contiene Plan de Trabajo 2027, Organigrama funcional, funciones de los cargos y contenido de Yesely y Lucero. Contenido y estilos de impresión de los flujos 02, 04 y 06 comparados con la referencia en el mismo estado inicial.
- Revisión visual de las nuevas tarjetas, organigrama e indicador de cierre en móvil. Sin desbordamiento horizontal de página en las cuatro resoluciones.

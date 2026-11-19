
const PROCESS_OPTIONS = [
  { value: 'all', label: 'Todos los procesos', hint: 'Mapa completo · 7 flujos' },
  { value: 'solicitudes', label: 'Atención de Solicitudes', hint: 'Flujo 1 · Martín y Adriana', color: '#E71230' },
  { value: 'escaneo', label: 'Escaneo e indexación', hint: 'Flujo 2 · Adriana y Yesely', color: '#0F766E' },
  { value: 'segen', label: 'SEGEN · Resoluciones', hint: 'Flujo 3 · Martín y Klaudia', color: '#C58A00' },
  { value: 'digitacion', label: 'Digitación Sílabos', hint: 'Flujo 4 · FAMED y FAENF', color: '#6D3BD1' },
  { value: 'calidad', label: 'Control de Calidad', hint: 'Flujo 5 · Sebastián', color: '#1D4ED8' },
  { value: 'historias', label: 'Historias Clínicas (CREO)', hint: 'Flujo 6 · Lucero', color: '#BE185D' },
  { value: 'proyectos', label: 'Proyectos Temporales', hint: 'Flujo 7 · Resoluciones y buscador SG', color: '#171914' }
];

const FLOWS = [];

/* ============================================================
   FLUJO 1 · Atención de solicitudes
   ============================================================ */
FLOWS.push({
  n: 1,
  shortName: 'Atención de solicitudes',
  fullName: 'Atención de Solicitudes de Documentos',
  groupLabel: 'Solicitudes',
  groups: ['solicitudes'],
  tone: '#E71230', toneBg: '#FDECEE',
  tagline: 'Recepción en Gmail, búsqueda en FileServer y derivación al Archivo de Secretaría General cuando el documento no está disponible.',
  people: ['martin', 'adriana'],
  systems: ['fileserver', 'sheets'],
  duration: '~5 h en ruta crítica',
  frequency: 'A demanda',
  status: 'Operativo', statusTone: 'live',
  mainSteps: ['f1s1', 'f1s2', 'f1s3'],
  steps: [
    {
      id: 'f1s1', n: 1, title: 'Recepción de la solicitud', owner: 'martin',
      support: ['adriana'],
      systems: [], channel: 'Gmail', time: '15 min', icon: 'fa-envelope-open-text',
      summary: 'Ingreso de la solicitud por Gmail y validación de los datos del pedido.',
      detail: 'El supervisor recepciona la solicitud enviada por Gmail, identifica el documento requerido y verifica que el pedido incluya los datos mínimos para iniciar la búsqueda.',
      inputs: ['Correo con la solicitud', 'Datos del documento requerido'],
      outputs: ['Solicitud registrada y asignada']
    },
    {
      id: 'f1s2', n: 2, title: 'Búsqueda en FileServer', owner: 'adriana',
      support: ['martin'],
      systems: ['fileserver'], time: '~1 hora', icon: 'fa-magnifying-glass',
      summary: 'Búsqueda del documento por área, año, tipo y número en el repositorio.',
      detail: 'Se realiza la búsqueda del documento en el repositorio FileServer utilizando criterios de área, año, tipo y número de documento. Si la solicitud es ambigua, se coordina con el usuario.',
      inputs: ['Criterios de búsqueda', 'Datos del solicitante'],
      outputs: ['Ubicación del documento o confirmación de ausencia']
    },
    {
      id: 'f1s3', n: 3, title: '¿Documento localizado?', owner: 'adriana',
      support: ['martin'],
      systems: ['fileserver'], time: '—', icon: 'fa-code-branch', decision: true,
      summary: 'Punto de decisión: responder con el documento o derivar a Secretaría General.',
      detail: 'Punto de decisión: si el documento existe en FileServer se responde directamente; si no, se deriva la búsqueda al Archivo de Secretaría General.',
      inputs: ['Resultado de la búsqueda en FileServer'],
      outputs: ['Ruta A: envío directo', 'Ruta B: derivación a Secretaría General']
    },
    {
      id: 'f1s4', n: 4, title: 'Envío + resguardo del documento', owner: 'adriana',
      support: ['martin'],
      systems: ['fileserver', 'sheets'], time: '15–30 min', icon: 'fa-paper-plane',
      summary: 'Entrega al solicitante y registro de la entrega para trazabilidad.',
      detail: 'Se envía el documento al solicitante y se registra la entrega en la hoja de control para mantener trazabilidad y evitar envíos duplicados.',
      inputs: ['Documento localizado', 'Correo del solicitante'],
      outputs: ['Documento enviado', 'Registro de entrega en Sheets/Drive']
    },
    {
      id: 'f1s5', n: 5, title: 'Solicitud al Archivo de Secretaría General', owner: 'martin',
      support: ['adriana'],
      systems: [], channel: 'Correo institucional', time: '≈ 4 h de respuesta', icon: 'fa-building-columns',
      summary: 'Derivación formal a Secretaría General con los datos del documento.',
      detail: 'Se deriva la solicitud al Archivo de Secretaría General por el canal institucional, adjuntando los datos del documento y del solicitante. El tiempo estimado de respuesta es de aproximadamente 4 horas.',
      inputs: ['Solicitud sin coincidencia local', 'Datos del documento y del solicitante'],
      outputs: ['Respuesta de Secretaría General']
    },
    {
      id: 'f1s6', n: 6, title: '¿Existe en Archivo de Secretaría General?', owner: 'martin',
      support: ['adriana'],
      systems: [], time: '—', icon: 'fa-code-branch', decision: true,
      summary: 'Evaluación de la respuesta de Secretaría General y siguiente ruta.',
      detail: 'Se evalúa la respuesta de Secretaría General. Si confirma la existencia del documento, se continúa con el envío y resguardo; si no existe, se notifica al usuario para que inicie el trámite formal.',
      inputs: ['Respuesta de Secretaría General'],
      outputs: ['Continuar en Paso 04', 'Notificación al usuario']
    },
    {
      id: 'f1s7', n: 7, title: 'Notificar al usuario para trámite formal', owner: 'martin',
      support: ['adriana'],
      systems: [], channel: 'Gmail', time: '15 min', icon: 'fa-bell',
      summary: 'Comunicación de ausencia y orientación al trámite correspondiente.',
      detail: 'Se comunica al usuario que el documento no fue localizado y se le orienta a iniciar el trámite formal correspondiente ante la instancia competente.',
      inputs: ['Confirmación de ausencia del documento'],
      outputs: ['Notificación enviada al usuario', 'Trámite formal iniciado']
    }
  ],
  branches: [
    {
      label: 'Sí', tone: 'success', short: 'Ruta directa',
      condition: 'Documento localizado en FileServer',
      stepIds: ['f1s4'],
      outcome: 'Fin del flujo · documento entregado y registrado'
    },
    {
      label: 'No', tone: 'danger', short: 'Ruta de derivación',
      condition: 'Documento no localizado en FileServer',
      stepIds: ['f1s5', 'f1s6'],
      subbranches: [
        {
          label: 'Sí', tone: 'success',
          condition: 'Secretaría General confirma existencia',
          linkStep: 'f1s4',
          linkLabel: 'Continuar en Paso 04 · Envío + resguardo'
        },
        {
          label: 'No', tone: 'danger',
          condition: 'No existe en Secretaría General',
          stepIds: ['f1s7']
        }
      ]
    }
  ],
  footer: {
    text: 'Ruta crítica estimada: ~1 hora de búsqueda local + un máximo referencial de 4 horas de respuesta de Secretaría General.'
  }
});

/* ============================================================
   TARJETA COMPARTIDA · FAENF · Sílabos
   Se define una sola vez y se pinta en Flujo 4 (origen) y en
   Flujo 2 · Digitalización (copia de seguimiento).
   ============================================================ */
const FAENF_SILABOS_LANE = {
  title: 'FAENF', subtitle: 'Facultad de Enfermería',
  icon: 'fa-user-nurse', color: '#6D3BD1', bg: '#F0EBFF',
  team: ['yesely'],
  systems: ['imaging', 'sheets'],
  status: 'Pendiente',
  statusTone: 'soon',
  current: [],
  headRows: [
    { label: 'Archivo: 1941 - 2020 (Proyección pendiente 1998-2020)', state: 'soon' }
  ],
  pending: [
    { label: 'Indexación y preservación', system: 'imaging', state: 'soon' }
  ],
  note: 'La indexación pendiente se realizará directamente en ImagingSoft.'
};

/* ============================================================
   FLUJO 2 · Traslado, digitalización e inventario
   ============================================================ */
FLOWS.push({
  n: 2,
  shortName: 'Escaneo e indexación',
  fullName: 'Traslado, acondicionamiento, digitalización, control e inventario',
  groupLabel: 'Digitalización',
  groups: ['escaneo'],
  tone: '#0F766E', toneBg: '#E6F5F3',
  tagline: 'Ciclo técnico del material documental: solicitud de cajas a Iron Mountain, traslado al Archivo FAMED, preparación, escaneo, indexación e inventario físico.',
  people: ['martin', 'adriana', 'yesely'],
  systems: ['imaging', 'sheets'],
  duration: 'Ciclo continuo · 8 etapas',
  frequency: 'FAMED-Diario',
  frequencyAlt: 'FAENF-A demanda',
  status: 'En operación', statusTone: 'live',
  inventory: {
    owner: 'adriana',
    links: [
      { label: 'Posgrado Enfermería', url: 'https://docs.google.com/spreadsheets/d/1_83o29wFrFORXX7abPdxYS6Dgih4h7VI/edit?gid=1052546054#gid=1052546054' },
      { label: 'Pregrado Sanidad Naval', url: 'https://docs.google.com/spreadsheets/d/1W4pez3ljaNghZYICTizM-4KeFCFzjWuz/edit?gid=804412311#gid=804412311' },
      { label: 'Consolidado 2024', url: 'https://docs.google.com/spreadsheets/d/1ANYpJbhfx9ThA6Pz9ij7diMWKyW0RFq-zXhFQCCgKHQ/edit?gid=777300826#gid=777300826' }
    ]
  },
  mainSteps: ['f2s0', 'f2s1', 'f2s2', 'f2s3', 'f2s4', 'f2s5', 'f2s6', 'f2s7'],
  bodySections: [
    { title: 'FAMED' },
    { title: 'FAENF', period: '2021-2026', steps: ['f2s2', 'f2s3', 'f2s4', 'f2s8'], owner: 'yesely', renumber: true },
    { card: FAENF_SILABOS_LANE }
  ],
  steps: [
    {
      id: 'f2s0', n: 1, title: 'Solicitud de material (cajas) a Iron Mountain', owner: 'martin',
      support: ['adriana'],
      systems: [], channel: 'Gmail', time: '3–4 días de respuesta', icon: 'fa-boxes-packing',
      summary: 'Pedido vía correo al almacén que resguarda el material archivístico.',
      detail: 'Se solicita el material archivístico (cajas) a Iron Mountain mediante correo electrónico al almacén que lo resguarda, indicando la relación de cajas requeridas y el sustento del pedido. La atención regular toma entre 3 y 4 días.',
      inputs: ['Requerimiento de material', 'Relación de cajas solicitadas'],
      outputs: ['Cajas solicitadas al almacén', 'Constancia del pedido por correo'],
      notice: {
        tone: 'rush',
        icon: 'fa-bolt',
        title: 'Tipo de solicitud · Rush',
        text: 'Además de la solicitud regular, existe el tipo de solicitud "Rush", que se atiende en 3–4 horas de respuesta.'
      }
    },
    {
      id: 'f2s1', n: 2, title: 'Traslado del material a procesar', owner: 'adriana',
      support: ['sebastian'],
      systems: [], channel: 'Traslado físico', time: '30 min', icon: 'fa-truck-fast',
      summary: 'Traslado de Archivo Central a Archivo FAMED con verificación de cajas.',
      detail: 'Se recibe y traslada el material documental desde el Archivo Central hacia el Archivo FAMED, verificando la relación de cajas y las condiciones de traslado.',
      inputs: ['Relación de material y cajas', 'Programación de traslado'],
      outputs: ['Material recepcionado en el Archivo FAMED']
    },
    {
      id: 'f2s2', n: 3, title: 'Preparación, depuración y reacondicionamiento', owner: 'adriana',
      systems: [], time: 'Variable', icon: 'fa-box-open',
      summary: 'Limpieza, orden y reacondicionamiento del material antes del escaneo.',
      detail: 'Se revisa el material, se retiran elementos metálicos o deteriorados, se ordenan las piezas y se reacondiciona la documentación para su digitalización.',
      inputs: ['Material recepcionado'],
      outputs: ['Material apto para escaneo']
    },
    {
      id: 'f2s3', n: 4, title: 'Validación e integración de contenido', owner: 'adriana',
      systems: ['sheets'], time: 'Variable', icon: 'fa-list-check',
      summary: 'Verificación de secuencia, completitud e integración del contenido.',
      detail: 'Se valida la secuencia, completitud e integración del contenido antes de escanear, registrando observaciones en la hoja de control.',
      inputs: ['Material preparado', 'Checklist de contenido'],
      outputs: ['Lote validado', 'Observaciones registradas en Sheets/Drive']
    },
    {
      id: 'f2s4', n: 5, title: 'Escaneo con driver mejorado', owner: 'adriana',
      systems: ['imaging'], time: 'Variable', icon: 'fa-camera-retro',
      summary: 'Digitalización con resolución y configuración optimizadas.',
      detail: 'Se digitaliza el material con el driver optimizado, ajustando resolución y configuración para mejorar la calidad y velocidad del escaneo.',
      inputs: ['Lote validado', 'Equipo de escaneo configurado'],
      outputs: ['Imágenes digitales del lote']
    },
    {
      id: 'f2s5', n: 6, title: 'Indexación y preservación', owner: 'adriana',
      systems: ['imaging'], time: 'Variable', icon: 'fa-tags',
      summary: 'Metadatos, naming y criterios de preservación en ImagingSoft.',
      detail: 'Se indexan los metadatos del documento en ImagingSoft y se aplican criterios de preservación y naming para asegurar su recuperación a largo plazo.',
      inputs: ['Imágenes digitales'],
      outputs: ['Documento indexado y disponible en ImagingSoft']
    },
    {
      id: 'f2s6', n: 7, title: 'Corroboración del inventario y archivamiento', owner: 'adriana',
      systems: ['sheets'], time: '½ día', icon: 'fa-boxes-stacked',
      summary: 'Validacion , rutulado, registro y preparación',
      detail: 'Validación del inventario, rotulado de cajas, registro en Excel y preparacion previa al traslado.',
      inputs: ['Material digitalizado', 'Relación de cajas'],
      outputs: ['Inventario actualizado', 'Cajas rotuladas y reubicadas']
    },
    {
      id: 'f2s7', n: 8, title: 'Gestión de traslado y recojo de material físico', owner: 'adriana',
      support: ['sebastian'],
      systems: [], channel: 'Traslado físico', time: 'Según programación', icon: 'fa-right-left',
      summary: 'Coordinación Almacén Archivo Central ↔ Archivo FAMED.',
      detail: 'Se coordina el traslado y recojo de material físico entre el Almacén del Archivo Central y el Archivo FAMED, dejando constancia del movimiento y de las cajas entregadas o devueltas.',
      inputs: ['Inventario actualizado', 'Requerimiento de recojo'],
      outputs: ['Material trasladado', 'Constancia de recojo']
    },
    {
      id: 'f2s8', n: 9, title: 'Guardado de resoluciones digitalizadas', owner: 'yesely',
      systems: [], channel: 'Disco local + PenDrive', time: 'Variable', icon: 'fa-hard-drive',
      summary: 'Respaldo en disco local y PenDrive antes de liberar el material.',
      detail: 'Las resoluciones digitalizadas se guardan en memoria en el disco local y en un PenDrive, manteniendo una copia de respaldo antes de liberar el material físico.',
      inputs: ['Resoluciones digitalizadas'],
      outputs: ['Copia en disco local', 'Respaldo en PenDrive']
    }
  ],
  footer: {
    text: 'La destrucción y eliminación del material se coordina con el Flujo 5; el recojo físico cierra el ciclo con el Archivo Central.',
    flow: 5, linkLabel: 'Ver Flujo 5 · Control de calidad'
  }
});

/* ============================================================
   FLUJO 3 · Indexación de resoluciones SEGEN
   ============================================================ */
FLOWS.push({
  n: 3,
  shortName: 'Resoluciones SEGEN',
  fullName: 'Indexación de Resoluciones SEGEN',
  groupLabel: 'SEGEN · Resoluciones',
  groups: ['segen'],
  tone: '#C58A00', toneBg: '#FFF6D9',
  tagline: 'Ingesta quincenal al repositorio ImagingSoft y clasificación de resoluciones en cinco tipos documentales para su recuperación.',
  people: ['martin', 'klaudia'],
  systems: ['imaging'],
  duration: 'Lote quincenal',
  frequency: 'Quincenal',
  status: 'Quincenal', statusTone: 'gold',
  steps: [
    {
      id: 'f3s1', n: 1, title: 'Ingesta al repositorio ImagingSoft', owner: 'martin',
      systems: ['imaging'], time: 'Quincenal', icon: 'fa-file-import',
      summary: 'Carga del lote de resoluciones y verificación del período.',
      detail: 'Se cargan los lotes de resoluciones al repositorio ImagingSoft, verificando que el paquete corresponda al período quincenal y que los archivos estén completos.',
      inputs: ['Lote de resoluciones digitalizadas', 'Relación del período'],
      outputs: ['Lote disponible en ImagingSoft']
    },
    {
      id: 'f3s2', n: 2, title: 'Clasificación por tipo de resolución', owner: 'klaudia',
      systems: ['imaging'], time: 'Quincenal', icon: 'fa-layer-group',
      summary: 'Asignación de una de las cinco categorías documentales definidas.',
      detail: 'Cada resolución se clasifica en una de las cinco categorías definidas: Alumnos, Docentes, Plan Curricular, Plan de Estudios y UPCH. Esta clasificación ordena la indexación y facilita la búsqueda posterior.',
      inputs: ['Resolución digitalizada'],
      outputs: ['Resolución clasificada por tipo']
    },
    {
      id: 'f3s3', n: 3, title: 'Indexación de metadatos en ImagingSoft', owner: 'klaudia',
      systems: ['imaging'], time: 'Quincenal', icon: 'fa-tags',
      summary: 'Completado de metadata, validación del lote y cierre quincenal.',
      detail: 'Se completa la metadata requerida para cada resolución: tipo, número, fecha, área y demás campos de búsqueda. Se valida el lote antes de cerrar la quincena y dejar las resoluciones localizables.',
      inputs: ['Resoluciones clasificadas'],
      outputs: ['Resoluciones localizables en ImagingSoft', 'Lote quincenal cerrado']
    }
  ],
  coverage: [
    { label: 'Alumnos', icon: 'fa-user-graduate' },
    { label: 'Docentes', icon: 'fa-chalkboard-user' },
    { label: 'Plan Curricular', icon: 'fa-book-open' },
    { label: 'Plan de Estudios', icon: 'fa-list-check' },
    { label: 'UPCH', icon: 'fa-building-columns' },
    { label: 'Convenios', icon: 'fa-file-signature' }
  ],
  footer: {
    text: 'Cobertura documental: seis tipos de resoluciones. Frecuencia de trabajo: quincenal.'
  }
});
/* ============================================================
   FLUJO 4 · Digitación de sílabos
   ============================================================ */
FLOWS.push({
  n: 4,
  shortName: 'Digitación de sílabos',
  fullName: 'Digitación de Sílabos · FAMED & FAENF',
  groupLabel: 'Sílabos',
  groups: ['digitacion'],
  tone: '#6D3BD1', toneBg: '#F0EBFF',
  tagline: 'Digitación de sílabos de Medicina y Enfermería con una meta diaria compartida, orden descendente por años y control de calidad posterior.',
  people: ['grace', 'yomira', 'klaudia', 'yesely'],
  systems: ['sheets', 'imaging'],
  duration: 'Meta diaria 25–30 hojas',
  frequency: 'Producción continua',
  status: 'En proceso', statusTone: 'gold',
  kind: 'digitacion',
  lanes: [
    {
      title: 'FAMED', subtitle: 'Facultad de Medicina',
      icon: 'fa-stethoscope', color: '#E71230', bg: '#FDECEE',
      team: ['grace', 'yomira', 'klaudia'],
      systems: ['sheets'],
      current: [
        { label: 'Pregrado', range: '1980 → 1974', state: 'now' }
      ],
      pending: [
        { label: 'Posgrado', range: '→ 2020', state: 'soon' },
        { label: 'Especialidad', range: 'Por iniciar', state: 'soon' }
      ],
      note: 'Orden de avance: años recientes → antiguo.'
    },
    FAENF_SILABOS_LANE
  ],
  footer: {
    text: 'El control de calidad y la auditoría de los sílabos digitados se desarrollan en el Flujo 5.',
    flow: 5, linkLabel: 'Ver Flujo 5 · Control de calidad'
  }
});

/* ============================================================
   FLUJO 5 · Control de calidad y gestión física
   ============================================================ */
FLOWS.push({
  n: 5,
  shortName: 'Control de calidad',
  fullName: 'Control de Calidad, Traslado y Eliminación Documental',
  groupLabel: 'Calidad',
  groups: ['calidad'],
  tone: '#1D4ED8', toneBg: '#E9EFFF',
  tagline: 'Auditoría de sílabos digitados, cotejo con el original, reporte Excel y resguardo digital.',
  people: ['sebastian'],
  systems: ['imaging', 'sheets'],
  duration: 'Auditoría por lote',
  frequency: 'Continua',
  status: 'Auditoría continua', statusTone: 'live',
  steps: [
    {
      id: 'f5s1', n: 1, title: 'Validación de metadatos de sílabos', owner: 'sebastian',
      systems: ['imaging'], time: 'Muestra diaria', icon: 'fa-circle-check',
      summary: 'Revisión de completitud y coincidencia de los metadatos del sílabo.',
      detail: 'Se revisa que los metadatos del sílabo digitado estén completos y coincidan con el documento original antes de continuar con el cotejo.',
      inputs: ['Sílabo digitado', 'Metadatos registrados'],
      outputs: ['Metadatos validados']
    },
    {
      id: 'f5s2', n: 2, title: 'Cotejo, corrección y reporte del sílabo', owner: 'sebastian',
      systems: ['sheets'], time: 'Diario', icon: 'fa-file-circle-check',
      summary: 'Comparación original vs. digitado, corrección y reporte Excel con apoyo de Python.',
      detail: 'Se compara el sílabo original con el digitado, se corrigen diferencias y se genera un reporte Excel. La revisión se apoya en un script en Python y librerías para detectar y aplicar mejoras de forma controlada.',
      inputs: ['Sílabo original', 'Sílabo digitado'],
      outputs: ['Sílabo corregido', 'Reporte Excel de auditoría']
    },
    {
      id: 'f5s3', n: 3, title: 'Guardado de sílabos auditados', owner: 'sebastian',
      systems: [], channel: 'Disco local + PenDrive', time: 'Al cierre de lote', icon: 'fa-hard-drive',
      summary: 'Respaldo en disco local y PenDrive antes de liberar el material.',
      detail: 'Los sílabos auditados se guardan en memoria en el disco local y en un PenDrive, manteniendo una copia de respaldo antes de liberar el material físico.',
      inputs: ['Sílabos auditados'],
      outputs: ['Copia en disco local', 'Respaldo en PenDrive']
    },
    {
      id: 'f5s4', n: 4, title: 'Eliminación de material archivístico', owner: 'sebastian',
      appearance: 'standard',
      systems: [], channel: 'Enlace · Flujo 2', time: 'Según lote', icon: 'fa-trash-can', linkFlow: 2,
      summary: 'Eliminación del material ya auditado y resguardado, con constancia.',
      detail: 'Se utiliza la trituradora para la destrucción física y eliminación del material que ya fue auditado y resguardado, siguiendo el procedimiento de eliminación documental y dejando constancia del lote eliminado.',
      inputs: ['Sílabos auditados y respaldados', 'Autorización de eliminación'],
      outputs: ['Material eliminado', 'Constancia de destrucción']
    },
    {
      id: 'f5s5', n: 5, title: 'Traslado y recojo de material físico', owner: 'sebastian',
      appearance: 'standard',
      systems: [], channel: 'Enlace · Flujo 2', time: 'Programado', icon: 'fa-truck-moving', linkFlow: 2,
      summary: 'Coordinación de cajas entre el Archivo Central y el Archivo FAMED.',
      detail: 'Se coordina el traslado y recojo de cajas entre el Almacén del Archivo Central y el Archivo FAMED, enlazando la gestión física con el Flujo 2 y dejando constancia del movimiento.',
      inputs: ['Inventario de cajas', 'Programación de recojo'],
      outputs: ['Cajas trasladadas o recuperadas', 'Constancia de movimiento']
    }
  ],
  bodySections: [
    { title: 'Control de Calidad', steps: ['f5s1', 'f5s2', 'f5s3'] },
    { title: 'Eliminacion de material documentario', steps: ['f5s4'] },
    { title: 'Traslado y Recojo de cajas Iron Mountain', steps: ['f5s5'] }
  ],
  footer: {
    text: 'Las salidas físicas de este flujo se conectan con el Flujo 2',
    flow: 2, linkLabel: 'Ver Flujo 2 · Gestión física'
  }
});

/* ============================================================
   FLUJO 6 · Historias clínicas CREO
   ============================================================ */
FLOWS.push({
  n: 6,
  shortName: 'Historias clínicas',
  fullName: 'Historias Clínicas · Clínica CREO',
  groupLabel: 'CREO',
  groups: ['historias'],
  tone: '#BE185D', toneBg: '#FDECF4',
  tagline: 'Custodia, préstamos, codificación, indexación física y archivo pasivo de historias clínicas con trazabilidad y acceso restringido.',
  people: ['lucero'],
  systems: ['sheets'],
  duration: 'Gestión permanente',
  frequency: 'A demanda',
  status: 'Operativo', statusTone: 'live',
  privacy: true,
  steps: [
    {
      id: 'f6s1', n: 1, title: 'Custodia de historias clínicas', owner: 'lucero',
      systems: [], channel: 'Clínica CREO', time: 'Permanente', icon: 'fa-shield-heart',
      summary: 'Control de acceso y ubicación física de cada expediente.',
      detail: 'Lucero mantiene la custodia física de las historias clínicas de la Clínica CREO, controlando el acceso y la ubicación de cada expediente.',
      inputs: ['Historia clínica recibida'],
      outputs: ['Expediente bajo custodia']
    },
    {
      id: 'f6s2', n: 2, title: 'Préstamos y trazabilidad', owner: 'lucero',
      systems: ['sheets'], time: 'A demanda', icon: 'fa-right-left',
      summary: 'Registro de préstamos y devoluciones con responsable y destino.',
      detail: 'Se registran préstamos y devoluciones con fecha, responsable y destino, asegurando la trazabilidad del expediente y su retorno oportuno al archivo.',
      inputs: ['Solicitud de préstamo', 'Expediente localizado'],
      outputs: ['Préstamo registrado', 'Devolución controlada']
    },
    {
      id: 'f6s3', n: 3, title: 'Codificación', owner: 'lucero',
      systems: [], time: 'Por lote', icon: 'fa-barcode',
      summary: 'Asignación del código único de identificación de la historia clínica.',
      detail: 'Se asigna el código de identificación a cada historia clínica según el esquema de la clínica, verificando que no existan duplicados y que el expediente corresponda al paciente.',
      inputs: ['Expediente validado'],
      outputs: ['Historia clínica codificada']
    },
    {
      id: 'f6s4', n: 4, title: 'Indexación física', owner: 'lucero',
      systems: ['sheets'], time: 'Por lote', icon: 'fa-folder-tree',
      summary: 'Ubicación en el archivador y actualización del índice.',
      detail: 'Se ubica cada expediente en el archivador físico correspondiente y se actualiza el índice para facilitar su recuperación y control.',
      inputs: ['Historia clínica codificada'],
      outputs: ['Expediente indexado', 'Índice actualizado']
    },
    {
      id: 'f6s5', n: 5, title: 'Archivo pasivo de HC', owner: 'lucero',
      systems: [], time: 'Permanente', icon: 'fa-box-archive',
      summary: 'Derivación de expedientes sin movimiento y conservación.',
      detail: 'Las historias clínicas sin movimiento se derivan al archivo pasivo, manteniendo condiciones de conservación y control de acceso.',
      inputs: ['Expediente sin movimiento'],
      outputs: ['Expediente en archivo pasivo']
    }
  ],
  footer: {
    text: 'Información sensible: acceso restringido, trazabilidad de préstamos y conservación física controlada.'
  }
});

/* ============================================================
   FLUJO 7 · Proyectos especiales
   ============================================================ */
FLOWS.push({
  n: 7,
  shortName: 'Proyectos especiales',
  fullName: 'Proyectos Especiales',
  groupLabel: 'Proyectos',
  groups: ['proyectos'],
  tone: '#171914', toneBg: '#EDE9DF',
  tagline: 'Resoluciones Académicas: Proyecto 01 con avance global calculado de 78.33 %. Proyecto 02: despliegue del sistema de búsqueda para Secretaría General.',
  people: ['grace', 'yomira', 'klaudia', 'sebastian'],
  systems: ['fileserver', 'imaging', 'sheets'],
  duration: '1 finalizado · 1 en despliegue',
  frequency: 'Por fases',
  status: 'Proyecto 01 finalizado · Proyecto 02 en despliegue', statusTone: 'gold',
  kind: 'projects',
  steps: [
    {
      id: 'f7s1', n: 1, title: 'Coordinar el proyecto y distribuir el trabajo', owner: 'yomira',
      support: ['grace', 'klaudia'],
      systems: [], channel: 'Reunión de equipo', time: '22–23/10/2026', icon: 'fa-people-group',
      summary: 'Encargo del proyecto y reunión del equipo de Archivo para distribuir actividades.',
      detail: 'El 22/10/2026 se encarga el proyecto y se realiza la reunión con la Dra. Musayón y la Mg. Alisson. El 23/10/2026 se reúne al equipo de Archivo para distribuir las actividades entre Yomira, Grace y Klaudia, definiendo los años y bloques de revisión.',
      inputs: ['Encargo del proyecto', 'Equipo de Archivo'],
      outputs: ['Actividades distribuidas', 'Cronograma de revisión']
    },
    {
      id: 'f7s2', n: 2, title: 'Recibir documentos y buscar resoluciones en ImagingSoft', owner: 'yomira',
      support: ['grace'],
      systems: ['imaging'], time: 'Desde 26/10/2026', icon: 'fa-magnifying-glass',
      summary: 'Recepción de los documentos de Martín Carbajo y búsqueda de resoluciones en ImagingSoft.',
      detail: 'El 26/10/2026 se reciben los documentos de alumnos proporcionados por el Sr. Martín Carbajo. La búsqueda de las resoluciones se realiza en ImagingSoft, sistema que no facilita una búsqueda rápida y se vuelve lento cuando se abren varios archivos.',
      inputs: ['Documentos proporcionados por Martín Carbajo', 'Criterios de búsqueda'],
      outputs: ['Resoluciones identificadas', 'Relación de archivos por revisar'],
      notice: {
        tone: 'gold',
        icon: 'fa-triangle-exclamation',
        title: 'Limitación de ImagingSoft',
        text: 'La búsqueda no es rápida: el sistema se pone lento y los archivos se desordenan cada vez que se abre otro. Además, hay documentos repetidos.'
      }
    },
    {
      id: 'f7s3', n: 3, title: 'Revisar, ordenar y clasificar las resoluciones', owner: 'yomira',
      support: ['grace'],
      systems: ['imaging'], time: 'Por bloque', icon: 'fa-layer-group',
      summary: 'Yomira y Grace revisan años distintos y clasifican por modalidad de admisión.',
      detail: 'Yomira revisa los años 2024–2016 y 2012–2011, e inicia la revisión del segundo bloque; Grace revisa 1976–2010 y 2013–2015, además de la búsqueda de los cronogramas. Ambas organizan las resoluciones según las modalidades: reincorporación o reinicio, cambio de carrera, traslados internos y externos, ingreso por talento y cambio de plan o carrera (2004–2020).',
      inputs: ['Resoluciones identificadas', 'Criterios de clasificación por modalidad'],
      outputs: ['Resoluciones ordenadas y clasificadas', 'Años cubiertos: 1976–2024']
    },
    {
      id: 'f7s3b', n: '3B', title: 'Preparar listados editables de alumnos en Excel', owner: 'klaudia',
      systems: ['sheets'], time: 'En paralelo', icon: 'fa-table-cells-large',
      summary: 'Listados editables por modalidad y programa para consolidar y comparar la información.',
      detail: 'En paralelo, Klaudia prepara listados editables de alumnos en Excel. El anexo «INGRESOS MEDICINA 2021» muestra pestañas por modalidad y programa: MED INGRESO CARRERA, REINCORPORA INGRESO CARRERA, TRAS EXT-MED INGRE, DOC-MED INGRE, MASTER-MED INGRE, DIPLOMADO-MED INGRE y 2DA ESPEC-MED INGRE.',
      inputs: ['Indicaciones del proyecto', 'Listado oficial de alumnos'],
      outputs: ['Listados editables de alumnos en Excel', 'Pestañas por modalidad y programa']
    },
    {
      id: 'f7s4', n: 4, title: 'Digitalizar y organizar los archivos en Google Drive', owner: 'grace',
      support: ['yomira'],
      systems: ['sheets'], time: 'Por bloque', icon: 'fa-cloud-arrow-up',
      summary: 'Carga de resoluciones en carpetas por año y por modalidad.',
      detail: 'Se digitalizan y cargan las resoluciones en Google Drive, dentro de Mi unidad > DOCUMENTACION > INGRESOS, con carpetas por año (2018 a 2024) y una carpeta REINCORPORACION. Los archivos se nombran con el código de la resolución (por ejemplo, TRANS-SEGEN-UPCH-2020-CU-0080).',
      inputs: ['Resoluciones clasificadas'],
      outputs: ['Archivos organizados por año en Google Drive', 'Carpeta REINCORPORACION']
    },
    {
      id: 'f7s5', n: 5, title: 'Registrar las resoluciones y sus enlaces en la base de datos', owner: 'yomira',
      support: ['grace'],
      systems: ['sheets'], time: 'Por bloque', icon: 'fa-database',
      summary: 'Base de datos con identificación de resoluciones y enlaces directos.',
      detail: 'Se elabora una base de datos que identifica cada resolución (tipo, número, año y modalidad) e incorpora enlaces directos a los archivos almacenados en Drive, de modo que puedan localizarse rápidamente.',
      inputs: ['Archivos en Google Drive'],
      outputs: ['Base de datos de resoluciones', 'Enlaces directos a los archivos']
    },
    {
      id: 'f7s6', n: 6, title: 'Consolidar la información de alumnos en Excel', owner: 'klaudia',
      support: ['yomira', 'grace'],
      systems: ['sheets'], time: 'Al cierre de bloque', icon: 'fa-table-list',
      summary: 'Integración de la base documental y los listados editables.',
      detail: 'Se consolida en Excel la información de alumnos proveniente de los listados editables y de la base de datos de resoluciones. Al 03/11/2026 se han revisado 2,076 archivos de alumnos, de un universo de 2,500 documentos de resoluciones registrados en el sistema.',
      inputs: ['Listados editables de alumnos', 'Base de datos de resoluciones'],
      outputs: ['Consolidado de alumnos en Excel', '2,076 archivos revisados']
    },
    {
      id: 'f7s7', n: 7, title: 'Comparar con el listado oficial de Secretaría Académica', owner: 'yomira',
      support: ['klaudia'],
      systems: ['sheets'], time: 'Previsto', icon: 'fa-code-compare',
      summary: 'Cruce del consolidado con el listado oficial de Secretaría Académica.',
      detail: 'Se prevé cruzar los registros consolidados con el listado oficial de Secretaría Académica para verificar que la información de alumnos coincida con el documento de referencia. El documento no confirma que este cruce se haya concluido.',
      inputs: ['Consolidado de alumnos', 'Listado oficial de Secretaría Académica'],
      outputs: ['Resultado del cruce de información']
    },
    {
      id: 'f7s8', n: 8, title: 'Identificar omisiones, duplicados e inconsistencias', owner: 'klaudia',
      support: ['yomira'],
      systems: ['sheets'], time: 'Previsto', icon: 'fa-triangle-exclamation',
      summary: 'Detección de diferencias entre la documentación y el listado oficial.',
      detail: 'Se busca detectar posibles omisiones, duplicados e inconsistencias entre la documentación de archivo y el listado oficial. Entre las dificultades registradas están los documentos repetidos y las resoluciones cuya fecha de expedición no coincide con la de sus anexos o ingresos.',
      inputs: ['Resultado del cruce'],
      outputs: ['Lista de omisiones, duplicados e inconsistencias']
    },
    {
      id: 'f7s9', n: 9, title: 'Verificar los documentos y registrar observaciones', owner: 'grace',
      support: ['yomira', 'klaudia'],
      systems: ['imaging', 'sheets'], time: 'Previsto', icon: 'fa-file-circle-check',
      summary: 'Revisión documental de cada diferencia y registro de observaciones.',
      detail: 'Se prevé verificar los documentos correspondientes a cada diferencia y registrar las observaciones encontradas, dejando constancia del sustento documental. La revisión se apoya en la base de datos con enlaces directos.',
      inputs: ['Lista de diferencias', 'Documentos digitalizados'],
      outputs: ['Documentos verificados', 'Observaciones registradas']
    },
    {
      id: 'f7s10', n: 10, title: 'Facilitar la consulta y entregar la documentación para titulación', owner: 'yomira',
      support: ['grace', 'klaudia'],
      systems: ['sheets'], time: 'Al cierre', icon: 'fa-graduation-cap',
      summary: 'Localización rápida de resoluciones y entrega para procesos de titulación.',
      detail: 'Se busca localizar y obtener rápidamente la documentación requerida durante los procesos de titulación, entregando el paquete documental verificado junto con el reporte de observaciones y la base de datos con enlaces.',
      inputs: ['Documentación verificada', 'Base de datos con enlaces'],
      outputs: ['Paquete documental para titulación', 'Reporte de observaciones']
    },
    {
      id: 'f7s11', n: 'A1', title: 'Recopilar resoluciones con cronogramas de admisión', owner: 'grace',
      systems: ['imaging'], time: '03/11/2026', icon: 'fa-calendar-days',
      summary: 'Identificación de las resoluciones que contienen cronogramas de admisión.',
      detail: 'Se recopilan las resoluciones que contienen cronogramas de admisión. El 03/11/2026 se recibieron los documentos UPCH correspondientes a los cronogramas solicitados, brindados por el Sr. Martín Carbajo, y se inició su revisión.',
      inputs: ['Resoluciones identificadas', 'Documentos UPCH de cronogramas'],
      outputs: ['Relación de resoluciones con cronogramas']
    },
    {
      id: 'f7s12', n: 'A2', title: 'Clasificar por año y criterios', owner: 'grace',
      systems: ['imaging'], time: 'En revisión', icon: 'fa-layer-group',
      summary: 'Orden de los cronogramas según año y criterios de clasificación.',
      detail: 'Las resoluciones con cronogramas se clasifican por año y criterios, manteniendo el mismo orden documental utilizado en la ruta principal.',
      inputs: ['Relación de resoluciones con cronogramas'],
      outputs: ['Cronogramas clasificados por año']
    },
    {
      id: 'f7s13', n: 'A3', title: 'Subir los archivos a Google Drive', owner: 'grace',
      support: ['yomira'],
      systems: ['sheets'], time: 'En revisión', icon: 'fa-cloud-arrow-up',
      summary: 'Carga de los cronogramas clasificados en Google Drive.',
      detail: 'Los archivos de cronogramas se suben a Google Drive en las carpetas correspondientes por año, asegurando su disponibilidad para el equipo.',
      inputs: ['Cronogramas clasificados'],
      outputs: ['Cronogramas disponibles en Google Drive']
    },
    {
      id: 'f7s14', n: 'A4', title: 'Registrar en Sheets con enlaces directos', owner: 'grace',
      systems: ['sheets'], time: 'En revisión', icon: 'fa-link',
      summary: 'Base de datos en Sheets con enlaces para localizar los cronogramas.',
      detail: 'Se elabora la base de datos en Sheets y se incorporan enlaces directos a cada archivo, de modo que las resoluciones con cronogramas puedan localizarse rápidamente.',
      inputs: ['Cronogramas en Google Drive'],
      outputs: ['Base de datos en Sheets', 'Enlaces directos a los cronogramas']
    }
  ],
  projects: [
    {
      name: 'Búsqueda histórica de resoluciones',
      tag: 'Proyecto 01',
      status: 'Finalizado',
      icon: 'fa-magnifying-glass',
      tone: '#E71230',
      detail: true,
      description: 'Organizar, digitalizar y centralizar las resoluciones académicas de admisión de Medicina, Enfermería, Estomatología y Tecnología Médica (pregrado, posgrado y residentado) mediante Google Drive y una base de datos vinculada, para facilitar la búsqueda, verificación y obtención de documentos en los procesos de titulación.',
      people: ['yomira', 'grace', 'klaudia'],
      systems: ['imaging', 'sheets'],
      time: '78.33%',
      timeNote: 'promedio simple de las actividades reportadas',
      scopeGroups: [
        { label: 'Carreras', items: ['Medicina', 'Enfermería', 'Estomatología', 'Tecnología Médica'] },
        { label: 'Niveles', items: ['Pregrado', 'Posgrado', 'Residentado'] },
        { label: 'Modalidades', items: ['Reincorporación / Reinicio', 'Cambio de carrera', 'Traslado interno y externo', 'Talento', 'Cambio de plan o carrera · 2004–2020'] }
      ],
      activityProgress: [
        {
          percent: 100, kicker: 'Actividad 01 · Ejecutada', title: 'Base de datos de admisiones por distintas modalidades',
          note: 'Revisión, clasificación, renombrado, organización, carga documental y elaboración de bases de datos.',
          blocks: [
            { label: 'Primer bloque', note: '2.076 resoluciones revisadas · recibido 26/10/2026', state: 'done' },
            { label: 'Segundo bloque', note: '385 resoluciones · completado · recibido 04/11/2026', state: 'done' },
            { label: 'Tercer bloque', note: '6 resoluciones de 2002 · completado · recibido 18/11/2026', state: 'done' },
            { label: 'Cobertura declarada', note: '1998–2024 · la fuente anota “No incluye 2002, 2025 y 2026”; también reporta el tercer bloque de 2002.', state: 'history' }
          ]
        },
        {
          percent: 100, kicker: 'Actividad 02 · Ejecutada', title: 'Cronogramas de admisión',
          note: 'Revisión, clasificación, organización, carga documental y elaboración de bases de datos.',
          blocks: [
            { label: 'Volumen y periodo', note: '1.936 resoluciones · periodo documental 2015–2024', state: 'done' },
            { label: 'Recepción', note: '04/11/2026', state: 'done' }
          ]
        },
        {
          id: 'actividad-03-consolidacion', percent: 35, kicker: 'Actividad 03 · En ejecución según el reporte', title: 'Consolidación del listado de alumnos para su comparación con el listado oficial de alumnos',
          note: 'Consolidación de Excel en curso. El cruce con la base de datos se realizará al finalizar la consolidación.',
          actions: { excelUrl: 'https://drive.google.com/drive/u/2/folders/1Tel4dZ2zFcSjjiIU_9gZ-yObuZjwrgYR' },
          blocks: [
            { label: 'Volumen', note: '610 resoluciones de alumnos ingresantes', state: 'now' },
            { label: 'Trabajo en curso', note: 'Revisión, organización, carga documental y elaboración de bases de datos.', state: 'now' },
            { label: 'Recepción 18/11/2026', note: 'Conglomerado de resoluciones, cartas y cronogramas de 1999–2009', state: 'history' },
            { label: 'Fecha estimada de término', note: '04/12/2026 · estimada, no confirmada', state: 'history' }
          ]
        }
      ],
      estimatedEnd: '2026-12-04',
      progressContext: 'Avance global calculado mediante promedio simple de las tres actividades reportadas: (100 % + 100 % + 35 %) / 3 = 78.33 %. No representa ponderaciones documentadas ni un cierre efectivo demostrado. Los porcentajes individuales se muestran por separado.',
      teamWork: {
        label: 'Equipo',
        title: 'Años y frentes asignados',
        items: [
          { icon: 'fa-user-tie', text: 'Yomira · Responsable · 2024–2016 y 2012–2011 · 2.º bloque' },
          { icon: 'fa-user-check', text: 'Grace · Apoyo documental · 1976–2010 y 2013–2015 · cronogramas' },
          { icon: 'fa-table-cells-large', text: 'Klaudia · Base de datos · listados editables en Excel' }
        ]
      },
      stepIds: ['f7s1', 'f7s2', 'f7s3', 'f7s4', 'f7s5', 'f7s6', 'f7s7', 'f7s8', 'f7s9', 'f7s10'],
      parallel: {
        kicker: 'En paralelo · Klaudia',
        stepId: 'f7s3b',
        join: 'Se integra en el paso 06',
        note: 'Klaudia prepara listados editables de alumnos en Excel, con pestañas por modalidad y programa, mientras Yomira y Grace revisan y clasifican las resoluciones por años distintos. La consolidación del paso 06 reúne ambos trabajos.'
      },
      extra: {
        kicker: 'Historial · línea adicional',
        title: 'Cronogramas de admisión',
        from: 'Se desprende del paso 02',
        status: 'Antecedente histórico',
        stepIds: ['f7s11', 'f7s12', 'f7s13', 'f7s14'],
        note: 'Reporte previo del 03/11/2026: recepción de los documentos UPCH para cronogramas e inicio de revisión. El nuevo reporte informa esta actividad al 100 %; se conserva aquí la trazabilidad del antecedente.'
      },
      difficulties: {
        label: 'Hallazgos',
        title: 'Dificultades presentadas',
        items: [
          { icon: 'fa-magnifying-glass', text: 'ImagingSoft no facilita una búsqueda rápida de documentos' },
          { icon: 'fa-gauge-high', text: 'El sistema se pone lento y los archivos se desordenan al abrir otro' },
          { icon: 'fa-calendar-xmark', text: 'La resolución puede tener un año y sus anexos o ingresos otra fecha' },
          { icon: 'fa-clone', text: 'Hay documentos repetidos' },
          { icon: 'fa-table-columns', text: 'Documentos con todas las carreras son muy extensos para consolidar' }
        ]
      },
      expected: {
        label: 'Resultados',
        title: 'Resultados esperados',
        items: [
          { icon: 'fa-database', text: 'Repositorio digital centralizado' },
          { icon: 'fa-link', text: 'Acceso rápido mediante enlaces' },
          { icon: 'fa-clock', text: 'Menor tiempo de búsqueda' },
          { icon: 'fa-route', text: 'Trazabilidad y organización' },
          { icon: 'fa-triangle-exclamation', text: 'Detección de inconsistencias' },
          { icon: 'fa-code-compare', text: 'Comparación con Secretaría Académica' },
          { icon: 'fa-table-list', text: 'Bases editables para consultas' },
          { icon: 'fa-graduation-cap', text: 'Gestión de titulación optimizada' }
        ]
      },
      nextSteps: {
        label: 'Historial de planificación',
        title: 'Ruta prevista antes del cierre global',
        items: [
          { icon: 'fa-list-check', text: 'Continuar revisión y clasificación' },
          { icon: 'fa-link', text: 'Completar y validar enlaces en Drive' },
          { icon: 'fa-code-compare', text: 'Cruzar información con Secretaría Académica' },
          { icon: 'fa-pen-to-square', text: 'Documentar observaciones' },
          { icon: 'fa-calendar-days', text: 'Iniciar segunda tarea y completar su base' }
        ]
      },
      foot: 'Avance global calculado por promedio simple: 78.33 % · actividades reportadas: 100 %, 100 % y 35 %; término 04/12/2026 estimado, no confirmado',
      footIcon: 'fa-chart-simple',
      link: {
        label: 'Ver presentación',
        url: 'https://docs.google.com/presentation/d/1cul4C7aiWsmqsD9W3auSDhQepUWVlfKimMdJ8FWLjYk/edit?usp=sharing'
      }
    },
    {
      name: 'Sistema de Búsqueda · Secretaría General',
      tag: 'Proyecto 02',
      status: 'Despliegue',
      icon: 'fa-window-restore',
      tone: '#9A6500',
      description: 'Diseño y despliegue de un buscador documental para Secretaría General, desde un MVP funcional hasta su puesta en producción.',
      people: ['sebastian'],
      systems: ['fileserver', 'sheets'],
      time: 'Pendiente por revisión',
      timeNote: '',
      scope: ['Buscador documental', 'Secretaría General', 'MVP → Producción'],
      phases: [
        { title: 'Fase 1 · Buscador MVP', desc: 'Base funcional y alcance mínimo' },
        { title: 'Fase 2a · Ajustes e implementación', desc: 'Iteración con usuarios' },
        { title: 'Fase 2b · Producción y despliegue', desc: 'Salida a operación' }
      ],
      foot: 'Pendiente por revisión',
      footIcon: 'fa-flag-checkered',
      mockup: {
        label: 'Mockup',
        url: './mockups/buscador-secretaria-general-mockup.html'
      }
    }
  ],
  footer: {
    text: 'Proyecto 01: avance global calculado de 78.33 % mediante promedio simple de las actividades reportadas; sin fecha exacta de cierre ni cantidades finales por etapa informadas. Proyecto 02: pendiente por revisión.'
  }
});

export { PROCESS_OPTIONS, FLOWS, FAENF_SILABOS_LANE };

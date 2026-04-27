Contexto para app simulador de layout de almacén (TecnoLogística S.A.)
Este archivo describe el contexto completo que la app debe simular: situación actual (AS‑IS), propuesta de mejora (TO‑BE) con layout en U, datos supuestos de tiempos, entidades del sistema (personas, equipos, vehículos), y los KPI que se visualizarán en los gráficos.

1. Información general del proyecto
Empresa: TecnoLogística S.A.

Giro: Fabricación de componentes electrónicos.

Proceso simulado: Operación del centro de almacenamiento de producto terminado.

Propósito de la app: Simulador visual e interactivo que muestre el antes (layout actual desordenado) y el después (layout en U optimizado) del almacén, con:

Recorrido de materiales desde recepción hasta despacho.

Movimiento de empleados, montacargas, camiones y robots (AGV).

Comparación de tiempos de proceso y KPIs entre AS‑IS y TO‑BE.

La app debe funcionar como una mini experiencia tipo "juego / gemelo digital" del almacén: vista tipo render 3D (isométrica o pseudo‑3D) de la planta con agentes animados.

2. Estructura de la app (páginas / vistas)
La app tendrá tres vistas principales accesibles desde un menú superior o lateral.

2.1 Página 1 – Escenario actual (AS‑IS)
Mostrar un almacén rectangular simple (vista superior isométrica), con las siguientes zonas:

Recepción y descarga (entrada principal con poco espacio, zona naranja).

Almacenamiento general (estanterías convencionales sin organización ABC, zona verde única).

Área de preparación de pedidos (picking + packing manual) (zona cian).

Despacho (zona azul, sin control automatizado).

El flujo de materiales debe verse caótico:

Camiones entrando por la misma zona donde también salen los pedidos.

Operarios caminando con recorridos largos y cruzándose entre sí.

Montacargas circulando mezclados con peatones.

No hay robots ni AGV.

Dejar claro en etiquetas que es el layout inicial desordenado.

2.2 Página 2 – Escenario propuesto (TO‑BE) con layout en U
Representar el layout en U exactamente como en el plano de referencia (solo nave, sin parqueaderos ni oficinas externas):

Dimensiones de referencia: nave de 55 m (ancho) x 70 m (alto).

Colores por zona (consistentes en toda la app):

Recepción y descarga: naranja.

Almacenamiento: tres zonas en verde (C más claro, B intermedio, A más oscuro).

Picking + packing: cian.

Despacho + staging: azul.

Distribución espacial (vista en planta, boca de la U mirando a la derecha):

Brazo superior (arriba):

Rectángulo horizontal naranja.

Etiqueta: RECEPCIÓN Y DESCARGA AMPLIADA.

Subzonas internas: Buffer zone e Inspección.

Puerta de entrada de producto en el extremo derecho, con flecha roja de entrada.

Columna izquierda (todo el alto):

Tres franjas horizontales verdes, de arriba a abajo:

ALMACENAMIENTO ZONA C – baja rotación.

ALMACENAMIENTO ZONA B – rotación media.

ALMACENAMIENTO ZONA A – alta rotación (con estanterías dinámicas por gravedad FIFO).

Brazo inferior (abajo):

Mitad izquierda cian: PICKING + PACKING (Pick‑to-Light, ergonomic stations).

Mitad derecha azul: DESPACHO + STAGING.

En el extremo derecho del brazo inferior, puerta de Salida de producto con flecha azul.

Cerca de la puerta, símbolo/etiqueta RFID.

El flujo debe verse claramente como una U sin cruces:

Flechas rojas: entrada → recepción → hacia la izquierda → bajan por las zonas de almacenamiento.

Flechas verdes/azules: desde zona A/B/C hacia picking, luego packing, y por último hacia despacho y salida.

Esta vista debe mostrar también los elementos automatizados: AGV, racks dinámicos, Pick‑to‑Light, portal RFID.

2.3 Página 3 – Resumen y KPIs
Vista tipo dashboard con gráficos comparando AS‑IS vs TO‑BE.

Debe mostrar:

Chart de barras de tiempos de proceso por etapa.

Chart de barras o líneas de KPIs globales (tiempo total, distancia recorrida, errores, productividad, nivel de servicio, ocupación de espacio).

Un pequeño texto narrativo explicando las mejoras.

Incluir un selector o pestañas para cambiar de indicador.

3. Datos numéricos supuestos
Nota: todos estos datos son supuestos para el simulador, no corresponden a mediciones reales.

3.1 Tiempos promedio por pedido (minutos)
Escenario AS‑IS
Proceso	Tiempo promedio (min/pedido)
Recepción	7
Almacenamiento	10
Picking	15
Packing	6
Despacho	8
Total	46
Escenario TO‑BE (layout en U + automatización)
Proceso	Tiempo promedio (min/pedido)
Recepción	4
Almacenamiento	5
Picking	7
Packing	4
Despacho	4
Total	24
La app debe tomar estos valores como valores por defecto, pero idealmente permitir editarlos (inputs) para que el usuario pueda probar otros escenarios.

3.2 Otros KPIs por pedido
Indicador	AS‑IS	TO‑BE (U)
Distancia recorrida por operario (m/pedido)	250	90
Tasa de errores de picking (% pedidos)	3.5	0.8
Productividad (pedidos/hora/operario picking)	4	7
Nivel de servicio OTIF (% pedidos completos y a tiempo)	90	99
Ocupación del espacio (% del área utilizada)	95	78
Estos indicadores deben graficarse en la página de resumen en formato barras tipo antes/después.

4. Entidades del simulador
La simulación debe representar explícitamente los siguientes actores y recursos, con sprites o modelos simples (estilo low‑poly/isométrico) pero claramente diferenciables.

4.1 Empleados
Crear al menos los siguientes tipos de agentes:

Operario de recepción

Zona de trabajo: recepción.

Tareas: descargar camiones, escanear productos, mover pallets a almacenamiento.

Operarios de almacenamiento

Zona: tres niveles ABC de almacenamiento.

Tareas: ubicar pallets en las estanterías, mover productos entre zonas cuando cambian las rotaciones.

Operarios de picking/packing

Zona: área cian (picking + packing).

Tareas: seguir instrucciones del sistema Pick‑to‑Light, recoger productos en rutas optimizadas, luego empacar y etiquetar pedidos.

Operario de despacho

Zona: staging/despacho.

Tareas: organizar pallets listos, verificarlos y cargarlos en camiones.

4.2 Equipos y vehículos
Montacargas (forklifts)

Circulan principalmente entre recepción y almacenamiento, y entre almacenamiento y despacho.

En AS‑IS comparten rutas con peatones; en TO‑BE las rutas se ven más definidas.

AGV (vehículo de guiado automático)

Solo en el escenario TO‑BE.

Ruta principal: movimientos entre almacenamiento (especialmente zona A) y área de picking/packing.

Mostrar una línea de trayectoria (punteada) en el piso.

Camiones de carga

En AS‑IS: entran y salen por la misma zona de muelle.

En TO‑BE: también se usan los mismos docks, pero el flujo interno es ordenado.

Deben representarse llegando, siendo cargados/descargados y saliendo.

Pallets y contenedores

Elementos que se mueven por las zonas, sobre montacargas, AGV o manualmente.

5. Lógica básica del simulador
5.1 Escenario AS‑IS
Generar pedidos a una tasa configurable (por ejemplo 1 pedido cada X segundos).

Para cada pedido:

Camión llega a recepción.

Operario descarga y lleva materiales a almacenamiento general (recorridos largos).

Operario de picking recorre estanterías de forma poco eficiente (ruta larga, con cruzamientos).

Packing manual en un área genérica.

Pedido va a zona de despacho; se carga al camión de salida.

Introducir aleatoriamente errores de picking (probabilidad 3.5%) que generan re‑trabajo.

Medir y mostrar en pantalla el tiempo total de cada pedido y el promedio acumulado.

5.2 Escenario TO‑BE (layout en U)
Misma generación de pedidos, pero con rutas optimizadas:

Camión llega a muelle de recepción (brazo superior).

Montacargas/AGV lleva producto a la zona ABC correspondiente (A/B/C).

Sistema Pick‑to‑Light genera ruta óptima; operario recorre distancias más cortas.

Packing en estaciones ergonómicas, justo al lado del picking.

Pallets/pedidos pasan por staging, atraviesan el portal RFID y se cargan.

Menor probabilidad de error (0.8%) y tiempos de cada proceso ajustados a los datos TO‑BE.

Mostrar en tiempo real el tiempo promedio por pedido y compararlo con el AS‑IS.

6. Interfaz y visualización
6.1 Requisitos generales
Estilo visual: isométrico / pseudo‑3D simple (no realista, pero legible), similar a un render 3D esquemático.

Vista principal: plano del almacén con las zonas coloreadas según el código de colores.

Animaciones suaves de:

Empleados caminando por rutas predefinidas.

Montacargas moviendo pallets.

AGV desplazándose por su trayectoria.

Camiones llegando, cargando/descargando y saliendo.

6.2 Controles
Botón para reproducir/pausar la simulación.

Slider o inputs para cambiar parámetros clave (opcional):

número de pedidos/hora;

tiempos de proceso por etapa;

número de operarios, montacargas y AGV.

Al pasar el mouse sobre cada zona, mostrar tooltip con información:

nombre de la zona;

tiempos promedio y errores asociados;

número de recursos asignados.

6.3 Página de resumen (dashboard)
Gráficos recomendados:

Barras comparativas AS‑IS vs TO‑BE de tiempo por proceso (5 barras por escenario).

Barras comparativas de KPIs globales:

Tiempo total por pedido;

Distancia recorrida;

Tasa de errores;

Productividad;

OTIF;

Ocupación de espacio.

Mostrar también:

Número total de pedidos simulados.

Ahorro estimado en tiempo (% de reducción) y mejora en nivel de servicio.

7. Texto de apoyo para la UI
Se pueden usar estos textos breves en la interfaz:

Título general de la app: "Simulador de Layout de Almacén – TecnoLogística S.A."

Descripción corta: "Explora cómo el rediseño del centro de almacenamiento, de un flujo caótico a un layout en U optimizado, reduce tiempos, recorridos y errores en TecnoLogística S.A."

Página AS‑IS: "Escenario actual: flujo desordenado, recorridos largos y alta tasa de errores en picking."

Página TO‑BE: "Escenario propuesto: layout en U con almacenamiento ABC, Pick‑to‑Light, AGV y flujo unidireccional de materiales."

Página Resumen: "Compara indicadores clave de desempeño (KPIs) antes y después de la optimización."


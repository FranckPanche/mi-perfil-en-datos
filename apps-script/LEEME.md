# Mi perfil en datos: guía rápida

## Versión sin conexión (la de referencia)
1. Copia `Index.html` en el computador del docente.
2. Ábrelo con doble clic en Chrome o Edge. No necesita internet.
3. Los datos quedan guardados en ese navegador y en ese equipo. Al final de cada sesión, entra al panel **Docente** y pulsa **Descargar copia completa (JSON)**.
4. Si trabajas en otro computador, usa **Unir copia JSON de otro equipo** para juntar los datos.

## Versión en línea (Google Apps Script)
Usa los tres archivos de la carpeta `apps-script`: `Code.gs`, `Index.html` y `Fuente.html`.

1. Con la cuenta del colegio (o la tuya), crea una hoja de cálculo nueva en Google Drive y llámala “Mi perfil en datos”.
2. En la hoja: Extensiones > Apps Script. Se abre el editor con un archivo `Código.gs`.
3. Borra lo que trae `Código.gs` y pega todo el contenido de `Code.gs`.
4. En la línea `const PIN_INICIAL = 'cambia-este-pin';` escribe tu PIN entre las comillas (mínimo 4 caracteres). Guarda con Ctrl+S.
5. Junto a “Archivos”, pulsa + > HTML y nómbralo exactamente `Index` (sin .html). Borra lo que trae y pega el contenido de `apps-script/Index.html`.
6. Repite con otro archivo HTML llamado exactamente `Fuente` y pega el contenido de `apps-script/Fuente.html`.
7. En la barra superior elige la función `configurar` y pulsa Ejecutar. Google pide permisos: Revisar permisos > tu cuenta > si aparece “Google no ha verificado esta app”, Configuración avanzada > Ir a … (no seguro) > Permitir. Es tu propio script; los permisos son para la hoja y para la carpeta de exportaciones en Drive.
8. Implementar > Nueva implementación > tipo Aplicación web. Ejecutar como: **Yo**. Quién tiene acceso: **cualquier usuario del dominio del colegio**, si el colegio tiene Google Workspace; si no, **Cualquier persona**. Pulsa Implementar y copia la URL.
9. Abre la URL, entra al panel Docente con tu PIN y crea un grupo DEMO para comprobar que la hoja se llena.

Qué queda protegido: los estudiantes guardan su propio registro sin PIN; borrar, reemplazar datos, cambiar ocupaciones y descargar exige el PIN, y el servidor lo verifica. Las descargas (CSV y copias JSON) se guardan en la carpeta de Drive “Mi perfil en datos - exportaciones” y el aplicativo muestra el enlace.

Para cambiar el PIN: edita `PIN_INICIAL`, guarda y vuelve a ejecutar `configurar`.
Cada vez que cambies el código: Implementar > Gestionar implementaciones > editar (lápiz) > Versión: Nueva versión > Implementar. La URL no cambia.

## Diseño
Tipografía Montserrat (licencia SIL Open Font License 1.1), incrustada en el archivo para que funcione sin conexión. Respeta las preferencias del sistema de reducir movimiento, reducir transparencia y aumentar contraste.

## Antes de usarlo en clase
- **Verifica los perfiles de ocupaciones.** Los 20 perfiles vienen marcados como provisionales. Para cada uno, busca la ocupación en O*NET OnLine (onetonline.org), abre la sección Interests, copia los seis valores en orden R I A S E C en la columna de conversión del panel docente, pulsa Convertir y guarda.
- **Crea un grupo DEMO** desde el panel docente. Trae respuestas, semáforos, errores e insignias simulados para practicar el módulo de curso, el simulador y la analítica antes de tener datos reales.
- **Perfil simulado**: para estudiantes sin consentimiento de su familia, en el módulo 1.

## La carta de navegación (gamificación)
- Diez puertos, uno por sesión. Se llega a cada puerto cumpliendo su tarea y registrando el semáforo metacognitivo (verde, amarillo o rojo, una idea y una duda).
- Las millas miden avance: 100 por puerto, 20 por semáforo y 50 por insignia. No hay clasificación entre estudiantes.
- Ocho insignias premian formas de razonar: Cuentas claras, Detective del error, Segunda mirada, Lector de cajas, Navegante del azar, Distancia a mano, Afirmación con límite y Bitácora completa.
- La flota del curso tiene cuatro metas colectivas, expresadas solo en porcentajes del grupo; una de ellas es que nadie quede a más de un puerto del más adelantado.
- **Sin dispositivos:** el botón Imprimir la carta (sin código elegido) da la carta en blanco. El estudiante marca el semáforo en papel (Anexo D) y el docente lo transcribe en el panel, en Registrar semáforos desde las hojas.

## Qué hace cada módulo
0. Mi carta: mapa de los diez puertos, semáforo de cada sesión, insignias y metas de la flota. En el puerto 2, predicciones y clasificación de variables (OA1).
1. Responder: registro de las 30 respuestas (transcripción rápida o botones).
2. Mis cuentas: compara puntajes, total, porcentajes y frecuencias calculados a mano; marca errores y solo muestra los valores del aplicativo después de que el estudiante clasifica su error.
3. Mi perfil: barras en cuadrícula, hexágono, código de tres letras frente a la predicción, barras de frecuencias de las respuestas, media y desviación típica del perfil, consistencia dentro de cada escala y rango percentil en el grado.
4. Nuestro curso: frecuencia del tipo dominante, diagrama circular (el estudiante calcula primero los grados), predicciones frente a lo observado, verificación a mano de las medidas de una escala (la tabla de medidas se abre después), diagrama de puntos, tallo y hojas, ojiva (visible después de verificar las medidas), diagramas de caja y una pregunta de lectura.
5. ¿Azar o asociación?: tabla de contingencia, barras apiladas al 100 %, probabilidad condicional calculada primero a mano, simulación y una pregunta de interpretación (el aplicativo no escribe la conclusión).
6. Ocupaciones: el estudiante calcula a mano la distancia a una ocupación antes de ver el cálculo y el ranking completo.
7. Mi tablero: hoja de vida en datos, imprimible en una página.
Docente: analítica del aprendizaje (semáforo por sesión, errores por tipo, alertas, dudas de la sesión, recorrido de cada estudiante, insignias del grupo y CSV), registro de semáforos desde papel, preprueba, posprueba y actitudes con diagrama de pendientes, indicadores del apartado de evaluación, datos y ocupaciones.

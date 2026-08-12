# TODO

## 1. Añadir el vídeo de YouTube `V2_b7akevSE`
- [ ] 1.1 - Obtener título, fecha y descripción del vídeo (oEmbed)
- [ ] 1.2 - Descargar la portada a `public/covers/`
- [ ] 1.3 - Añadir la entrada a `src/data/api.json` (image, url, tags, archive)
- [ ] 1.4 - Subir el vídeo a archive.org y enlazar `archive` si procede

## 2. Añadir ambas charlas de Galiciencia
- [ ] 2.1 - Localizar los enlaces de ambas charlas
- [ ] 2.2 - Obtener metadatos de cada una (título, fecha, descripción)
- [ ] 2.3 - Descargar las portadas
- [ ] 2.4 - Añadir las entradas a `src/data/api.json`
- [ ] 2.5 - Subir los vídeos a archive.org si es necesario

## 3. Reescribir todas las descripciones
- [ ] 3.1 - Revisar las descripciones actuales
- [ ] 3.2 - Reescribir cada una en inglés (máx. 500 caracteres)
- [ ] 3.3 - Verificar longitud, coherencia y build

## 4. Rehacer todas las covers
- [ ] 4.1 - Revisar las 29 covers actuales
- [ ] 4.2 - Generar nuevas portadas consistentes
- [ ] 4.3 - Mantener el esquema `<id>.<ext>` en `public/covers/`
- [ ] 4.4 - Verificar que todas cargan y el build pasa

## 5. Comprobar el responsive
- [ ] 5.1 - Probar el hero/billboard en móvil y tablet
- [ ] 5.2 - Probar las filas de tarjetas y el scroll en pantallas pequeñas
- [ ] 5.3 - Probar el modal en móvil (pantalla completa)
- [ ] 5.4 - Probar la página de tags y la navegación en móvil
- [ ] 5.5 - Verificar el nav fijo y el footer en distintos anchos
- [x] 5.6 - Usar `background-size: cover` en el billboard (en vez de `100% 100%`)

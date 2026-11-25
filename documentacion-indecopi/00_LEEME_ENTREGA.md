# Paquete de documentación complementaria — PsicoRapport

**Destinatario:** Dirección de Derecho de Autor — INDECOPI  
**Expediente / observación:** revisión pendiente por ausencia de partes sustanciales del código fuente y de la memoria descriptiva  
**Programa:** PsicoRapport (también referido como Psico Rapport)  
**Marco normativo citado:** Decisión Andina 351

---

## Qué pide el evaluador (en lenguaje claro)

| Pedido de INDECOPI | Qué entregar | Dónde está en esta carpeta |
| --- | --- | --- |
| Partes sustanciales del **código fuente** | Archivos fuente propios que muestran la expresión programática (no basta con el enlace a GitHub) | `01_codigo_fuente_partes_sustanciales/` |
| **Memoria descriptiva** | Documento técnico que describe qué es el programa, cómo está organizado y qué se protege | `03_memoria_descriptiva/` |
| **Ejecutable** / forma de reproducción | Binario instalable (APK/AAB) además del manual | `02_ejecutable/` |
| Manual de usuario (complemento) | Manual formal alineado a las funciones reales del software | `04_manual_usuario/` |
| Aclaraciones sobre **gráficos y denominaciones** | Declaración de autoría / origen de nombre, mascota, íconos, etc. | `05_recursos_graficos/` + `03_.../02_ACLARACION_...` |

**Importante:** esto corresponde a **registro de derecho de autor sobre programa de ordenador**, no a una patente de invención. La Decisión Andina 351 protege la *expresión* del programa (código, estructura creativa, interfaz propia), no las ideas genéricas (chat, ánimo, mascota).

---

## Cómo presentar la respuesta

1. Completar en todos los documentos los campos marcados `[COMPLETAR: ...]`.
2. Imprimir o exportar a PDF (según el canal del expediente):
   - Carta de respuesta
   - Memoria descriptiva
   - Manual de usuario
   - Índice del código fuente
   - Aclaración de recursos gráficos y denominaciones
3. Adjuntar el contenido de `01_codigo_fuente_partes_sustanciales/` (ZIP o USB/CD según indiquen).
4. Adjuntar el ejecutable `02_ejecutable/PsicoRapport-app-release.aab` (y el APK si ya lo presentaron, mencionarlo en la carta).
5. Adjuntar capturas del manual: ya están en `04_manual_usuario/capturas/` (Figuras 1–12) e incrustadas en el Markdown.

---

## Contenido de esta carpeta

```
documentacion-indecopi/
├── 00_LEEME_ENTREGA.md
├── 01_codigo_fuente_partes_sustanciales/
├── 02_ejecutable/
├── 03_memoria_descriptiva/
├── 04_manual_usuario/
├── 05_recursos_graficos/
└── 06_carta_respuesta/
```

---

## Repositorio de desarrollo (referencia, no sustituye el depósito)

- URL: https://github.com/antonyayansi/psico-rapport  
- El evaluador pidió el depósito de las **partes sustanciales** del código. El repositorio es prueba de existencia y versionado, pero **no reemplaza** el envío formal del código dentro del expediente.

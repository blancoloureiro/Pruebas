# Contador de "Spoiler" en YouTube

Aplicación web con dos vistas:

1. Un formulario para introducir una URL de YouTube.
2. Una pantalla de contador que simula en tiempo real cuántas veces aparece la palabra **"Spoiler"** en la transcripción del video.

## Requisitos

- Node.js 18+

## Ejecutar

```bash
npm install
npm start
```

Luego abre `http://localhost:3000`.

## Notas

- La app depende de que el video tenga subtítulos/transcripción disponibles.
- Se acepta URL de `youtube.com/watch?v=...`, `youtu.be/...`, `shorts` y `embed`.

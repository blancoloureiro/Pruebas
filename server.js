const express = require('express');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

function extractVideoId(input) {
  try {
    const url = new URL(input);
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v');
      }
      if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.split('/')[2];
      }
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/')[2];
      }
    }
  } catch (_error) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }
    return null;
  }

  return null;
}

app.get('/api/transcript', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Debes proporcionar la URL del video.' });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'URL de YouTube no válida.' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'es'
    });

    if (!transcript?.length) {
      return res.status(404).json({ error: 'No se encontró transcripción para este video.' });
    }

    return res.json({
      videoId,
      transcript: transcript.map((entry) => ({
        text: entry.text,
        offset: entry.offset,
        duration: entry.duration
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: 'No se pudo obtener la transcripción. Asegúrate de que el video tenga subtítulos disponibles.',
      detail: error.message
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});

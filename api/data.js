import { get, put } from '@vercel/blob';

const PATHNAME = 'dashboard-treinamentos/base-atual.json';

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  noStore(res);

  if (req.method === 'GET') {
    try {
      const result = await get(PATHNAME, { access: 'private', useCache: false });
      if (!result || result.statusCode !== 200) {
        return res.status(404).json({ error: 'Nenhuma base central publicada ainda.' });
      }
      const text = await new Response(result.stream).text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(text);
    } catch (error) {
      if (error?.statusCode === 404) {
        return res.status(404).json({ error: 'Nenhuma base central publicada ainda.' });
      }
      console.error('Erro ao ler base central:', error);
      return res.status(503).json({
        error: 'A base central ainda não está disponível. Conecte um Vercel Blob privado a este projeto.'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (!body || !Array.isArray(body.trainings) || !body.trainings.length) {
        return res.status(400).json({ error: 'Base de treinamentos inválida.' });
      }
      if (body.trainings.length > 5000) {
        return res.status(413).json({ error: 'A base possui registros demais para esta configuração.' });
      }

      const payload = {
        version: 2,
        savedAt: new Date().toISOString(),
        fileName: String(body.fileName || 'Planilha importada').slice(0, 200),
        sheet: String(body.sheet || '').slice(0, 200),
        trainings: body.trainings
      };

      await put(PATHNAME, JSON.stringify(payload), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0
      });

      return res.status(200).json({
        ok: true,
        savedAt: payload.savedAt,
        count: payload.trainings.length
      });
    } catch (error) {
      console.error('Erro ao salvar base central:', error);
      return res.status(503).json({
        error: 'Não foi possível publicar a base central. Verifique se um Vercel Blob privado está conectado ao projeto.'
      });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método não permitido.' });
}

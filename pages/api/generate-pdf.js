import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req, res) {
  // CORS — обязательно для междоменных запросов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Обрабатывать только POST-запросы
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // Разбираем тело запроса
  let body = req.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  const { tracks } = body || {};
  if (!Array.isArray(tracks)) {
    res.status(400).json({ error: 'Tracks must be an array' });
    return;
  }

  // Генерируем PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = 800;

  page.drawText('Favorite Tracks', { x: 50, y, size: 24, font, color: rgb(0, 0, 0) });
  y -= 40;

  tracks.forEach(({ title, artist }, i) => {
    page.drawText(`${i + 1}. ${title} – ${artist}`, { x: 50, y, size: 16, font, color: rgb(0, 0, 0) });
    y -= 24;
  });

  const pdfBytes = await pdfDoc.save();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="favorites.pdf"');
  res.status(200).send(Buffer.from(pdfBytes));
}

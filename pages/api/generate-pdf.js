import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  // Debug-лог для проверки запроса
  console.log('REQUEST:', req.method, req.body);

  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // Для совместимости с разными версиями Next.js (иногда req.body — строка)
  let body = req.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { tracks } = body;
  if (!Array.isArray(tracks)) {
    res.status(400).json({ error: 'Tracks must be an array' });
    return;
  }

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="favorites.pdf"');
  // Отдаем PDF напрямую в ответ
  doc.pipe(res);

  doc.fontSize(20).text('Favorite Tracks', { align: 'center' }).moveDown();
  tracks.forEach(({ title, artist }, i) => {
    doc.fontSize(14).text(`${i + 1}. ${title} – ${artist}`);
  });

  doc.end();
}

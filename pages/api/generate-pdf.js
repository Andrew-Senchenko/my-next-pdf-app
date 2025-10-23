import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

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
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="favorites.pdf"');
    res.status(200).end(pdfBuffer);
  });

  doc.fontSize(20).text('Favorite Tracks', { align: 'center' }).moveDown();
  tracks.forEach(({ title, artist }, i) => {
    doc.fontSize(14).text(`${i + 1}. ${title} – ${artist}`);
  });

  doc.end();
}

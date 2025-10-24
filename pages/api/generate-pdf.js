import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from 'fontkit';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let tracks = [];
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    tracks = Array.isArray(body.tracks) ? body.tracks : [];
  }

  if (req.method === 'GET') {
    if (req.query.tracks) {
      try {
        const decoded = decodeURIComponent(req.query.tracks);
        tracks = JSON.parse(decoded);
      } catch (e) {
        tracks = [];
      }
    }
  }

  if (!Array.isArray(tracks) || tracks.length === 0) {
    res.status(400).json({ error: 'No tracks provided' });
    return;
  }

  // Лог для отладки
  console.log('!!! fontkit', fontkit);

  const fontPath = path.join(process.cwd(), 'fonts', 'Inter-V.ttf');
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  console.log('!!! Registered fontkit');

  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(fontBytes);
  console.log('!!! Embedded font');

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

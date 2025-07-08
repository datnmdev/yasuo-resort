import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

export async function htmlToPdf(htmlPath: string, pdfPath: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '2cm',
      bottom: '2cm',
      left: '2.5cm',
      right: '2.5cm',
    },
  });

  await browser.close();
}

const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 2000 });
  await page.goto('file:///home/fmuhlhauser/Escritorio/Paginas%20Webs/autoshock_html/productos.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
     window.scrollBy(0, 800);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({path: 'amortiguadores_puppeteer.png'});
  await browser.close();
})();

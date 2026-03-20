const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 1000 });
  await page.goto('file:///home/fmuhlhauser/Escritorio/Paginas%20Webs/autoshock_html/productos.html', { waitUntil: 'networkidle0' });
  
  const displayVal = await page.evaluate(() => {
     let el = document.querySelector('#mg-amortiguadores .product-img-wrapper:nth-child(2)');
     return el ? window.getComputedStyle(el).display : 'Not Found';
  });
  console.log("Image 2 display:", displayVal);

  const gridVal = await page.evaluate(() => {
     let el = document.querySelector('#livianos .product-brand-logos-featured');
     return el ? window.getComputedStyle(el).display : 'Not Found';
  });
  console.log("Logos display:", gridVal);
  
  await browser.close();
})();

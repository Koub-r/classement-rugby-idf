const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = 'https://rugbyamateur.fr/regionales/ile-de-france/regionale-2/classement/';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(URL, {waitUntil: 'networkidle2'});

  const html = await page.content();
  const $ = cheerio.load(html);

  let equipes = [];

  $("table.table-striped").each((i, table) => {
    const poule = `Poule ${i + 1}`;

    $(table).find("tbody tr").each((_, row) => {
      const td = $(row).find("td");
      equipes.push({
        club: td.eq(1).text().trim(),
        joues: parseInt(td.eq(2).text()) || 0,
        points: parseInt(td.eq(3).text()) || 0,
        diff: parseInt(td.eq(8).text()) || 0,
        poule
      });
    });
  });

  equipes.sort((a,b) => b.points - a.points);
  equipes.forEach((e,i) => e.rang = i + 1);

  fs.writeFileSync("classement.json", JSON.stringify(equipes, null, 2));
  console.log("Classement mis à jour avec", equipes.length, "équipes");

  await browser.close();
})();

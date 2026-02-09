const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const URL = "https://rugbyamateur.fr/regionales/ile-de-france/regionale-2/classement/";

async function run() {
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);

  let equipes = [];

  $(".table").each((i, table) => {
    const poule = `Poule ${i + 1}`;
    $(table).find("tbody tr").each((_, row) => {
      const td = $(row).find("td");
      equipes.push({
        club: td.eq(1).text().trim(),
        joues: parseInt(td.eq(2).text()),
        points: parseInt(td.eq(3).text()),
        diff: parseInt(td.eq(8).text()),
        poule
      });
    });
  });

  equipes.sort((a,b) => b.points - a.points);
  equipes.forEach((e,i)=> e.rang = i+1);

  fs.writeFileSync("classement.json", JSON.stringify(equipes, null, 2));
}

run();

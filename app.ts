const csv = require('csv-parser')
const puppeteer = require('puppeteer');
const fs = require('fs')
const readlineSync = require('readline-sync');
const results = [];
let axi=1
let data = `CNPJ,Razão Social,Nome Fantasia,Data da Abertura,Porte,Natureza Jurídica`;
fs.writeFileSync('relatorio.csv', data);
console.log('Lendo dados🚀');
fs.createReadStream('dados.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('Iniciar busca📚');
    let antes=Date.now(); 
    consultaCNPJ([{CNPJ:"14.380.200/0001-21"}]);
    let depois=(Date.now() - antes)*results.length
    if (depois>=60) {
      depois=depois/60
      console.log(`Tempo estimado ${depois.toFixed(2)} minutos ⌛`);
    }else{
      console.log(`Tempo estimado ${depois} segundos ⌛`);
    }
    let option= readlineSync.question('Gostaria de realizar a pesquisa(S/N)? ');
    if (option=="s"||option=="S"){
      data=""
      data = `CNPJ,Razão Social,Nome Fantasia,Data da Abertura,Porte,Natureza Jurídica`;7
      console.clear();
      console.log('Busca em andamento...');
      consultaCNPJ(results);
    }
  });

async function consultaCNPJ(params) {
  const browser = await puppeteer.launch();
  const context = await browser.createIncognitoBrowserContext();
  const page = await browser.newPage();
  for (let index = 0; index < params.length; index++) {
    await page.goto(`https://cnpj.biz/${params[index].CNPJ}`);
    const dimensions = await page.evaluate(() => {
      let natu, nom, raz, dat, port;
      if (document.getElementsByTagName("p")[4].innerText[0] == "N") {
        raz = document.getElementsByTagName("b")[2].innerText;
        natu = document.getElementsByTagName("b")[6].innerText;
        nom = document.getElementsByTagName("h1")[0].innerText.replace(
          ' - ' + document.getElementsByTagName("b")[0].innerText, "");
        dat = document.getElementsByTagName("b")[3].innerText;
        port = document.getElementsByTagName("b")[5].innerText;

      } else if (document.getElementsByTagName("p")[5].innerText[0] == "N") {
        raz = document.getElementsByTagName("b")[2].innerText;
        natu = document.getElementsByTagName("b")[7].innerText;
        nom = document.getElementsByTagName("b")[3].innerText;
        dat = document.getElementsByTagName("b")[4].innerText;
        port = document.getElementsByTagName("b")[6].innerText;
      }
      return {
        nome: nom,
        natureza: natu,
        razao: raz,
        data_abertura: dat,
        porte: port,
      };
    });
    data = data + `\n${params[index].CNPJ},${dimensions.razao},${dimensions.nome},${dimensions.data_abertura},${dimensions.porte},${dimensions.natureza}`
    fs.writeFileSync('relatorio.csv', data);
  }
  await browser.close();
  if (axi!=1) {
    console.clear();
    console.log('Busca terminado✅');
  }
  axi=0;
}
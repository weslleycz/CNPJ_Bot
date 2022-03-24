const csv = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer');
const results = [];
let data = `CNPJ,Nome Fantasia,Natureza Jurídica`;
fs.writeFileSync('relatorio.csv', data);
console.log('Lendo dados🚀');
fs.createReadStream('dados.csv')
  .pipe(csv())
  .on('data', (data) =>results.push(data))
  .on('end', () => {
    console.log('Iniciar busca📚');
   consultaCNPJ(results);
  });
  
  async function consultaCNPJ(params) {
    console.clear();
    console.log('Busca em andamento...');
    const browser = await puppeteer.launch();
    const context = await browser.createIncognitoBrowserContext();
    const page = await browser.newPage();
    for (let index = 0; index < params.length; index++) {
      await page.goto(`https://cnpj.biz/${params[index].CNPJ}`);
      const dimensions = await page.evaluate(() => {
        let natu;
        let nom;
        if (document.getElementsByTagName("p")[4].innerText[0]=="N") {
          natu=document.getElementsByTagName("b")[6].innerText
          nom=document.getElementsByTagName("h1")[0].innerText.replace(
            document.getElementsByTagName("b")[0].innerText,
            "");
        }else if(document.getElementsByTagName("p")[5].innerText[0]=="N"){
          natu=document.getElementsByTagName("b")[7].innerText
          nom=document.getElementsByTagName("b")[3].innerText
        }
        return {
          nome:nom,
          natureza:natu,
        };
      });
    data=data+`\n${params[index].CNPJ},${dimensions.nome},${dimensions.natureza}`
    fs.writeFileSync('relatorio.csv',data);
    }
  await browser.close();
  console.clear();
  console.log('Busca terminado✅');
  }
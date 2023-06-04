// node 1_hackerrankautomation.js --url=https://www.hackerrank.com  --config=config.json

// npm init -y
// npm install minimist
// npm install puppeteer

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8")
let configJSO = JSON.parse(configJSON);


async function run(){
  let browser = await puppeteer.launch({
      headless:false,
      args: [
        '--start-maximized'
      ],
      defaultViewport:null

  });

  let page =await browser.newPage();
  await page.goto(args.url);

  await page.waitForSelector("a[href*='/access-account/']");
  await page.click("a[href*='/access-account/']");

  await page.waitForSelector("a[href*='/login/']");
  await page.click("a[href*='/login/']");

  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']",configJSO.userid, {delay:50});
  
  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']",configJSO.password, {delay:50});

  await page.waitForSelector("button[data-analytics='LoginPassword']");
  await page.click("button[data-analytics='LoginPassword']");

  await page.waitForSelector("a[data-analytics='NavBarContests']");
  await page.click("a[data-analytics='NavBarContests']");

  await page.waitForSelector("a[href ='/administration/contests/']");
  await page.click("a[href ='/administration/contests/']");


  //find number of pages 
  await page.waitForSelector('a[data-attr1="Last"]');
  let numpages = await page.$eval('a[data-attr1="Last"]',function (atag){
      let totpages = parseInt(atag.getAttribute("data-page"));
      return totpages;
  });
     for(let i = 1; i <= numpages; i++){
      await handleAllContestsOfAPage(page,browser);

      if(i != numpages){
        await page.waitForSelector('a[data-attr1="Right"]');
        await page.click('a[data-attr1="Right"]');

      }
     }

}

async function handleAllContestsOfAPage(page, browser){
      // find all urls same page.
  
  await page.waitForSelector("a.backbone.block-center");
  let curls =  await page.$$eval("a.backbone.block-center", function(atags){
   let urls = [];

   for(let i =0; i < atags.length; i++){
    let url = atags[i].getAttribute("href");
        urls.push(url);
   }

   return urls;

  });
   
   for(let i = 0; i < curls.length; i++){
    let ctab = await browser.newPage();
    await saveModeratorInContest(ctab, args.url + curls[i], configJSO.moderator);
    await ctab.close();
    await page.waitForTimeout(3000);

   }
}
  
async function saveModeratorInContest (ctab, fullCurl, moderator){
  await ctab.bringToFront();
  await ctab.goto(fullCurl);
  await ctab.waitForTimeout(3000);


  await ctab.waitForSelector("li[data-tab='moderators']");
  await ctab.click("li[data-tab='moderators']");

  await ctab.waitForTimeout(3000);
  await ctab.waitForSelector("input#moderator");
  await ctab.type("input#moderator", moderator, {delay: 50});
  
  await ctab.keyboard.press("Enter");
}

run();
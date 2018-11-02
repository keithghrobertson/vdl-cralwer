const request             = require('request-promise')
const cheerio             = require('cheerio')
const cheerioTableparser  = require('cheerio-tableparser')
const jsonfile            = require('jsonfile')

// Get the third item passed in when calling the script
const url = process.argv[2]

// Asynchronously grab the desired website
request(url)
.then((body)=>{
  // Take the body returned by the site, and pass it into our scrape function
  scrapeHTML(body)
})
.catch((e)=>{
  // Catch request errors here
  console.log(e)
})

// Our function we will pass HTML to, to crawl through
function scrapeHTML(body) {
  // Load the scraped HTML into a cheerio jQuery object
  const $ = cheerio.load(body)

  // Use cheerio-tableparser package to hook our jQuery object
  cheerioTableparser($)

  // Parse the table, thank god there's only one unnamed table on the VDL site
  const parsedTable = $("table").parsetable()

  // Get the list of teams
  const teams = parsedTable[0];

  //these positions in the array consist of titles and blank rows, so let's remove them
  const removeValFromIndex = [0,13,14,27,28,41,42];    

  for (var i = removeValFromIndex.length -1; i >= 0; i--){
    teams.splice(removeValFromIndex[i],1);
  }

  // Get list of score
  const scores = parsedTable[1]
  
  //remove the list of keys that are titles/blank
  for (var i = removeValFromIndex.length -1; i >= 0; i--){
    scores.splice(removeValFromIndex[i],1);
  }

  //TIER 1/A calculations. Each win = 8 points, so multiply number of wins by 8 to get their score.
  var i;
  for (i = 0; i < 12; i++) { 
    scores[i] = scores[i] * 8;
  }

  //TIER 2/B calculations. Each win = 4 points, so multiply number of wins by 4 to get their score.
  for (i = 12; i < 24; i++) { 
    scores[i] = scores[i] * 4;
  }

  //TIER 3/C calculations. Each win = 2 points, so multiply number of wins by 2 to get their score.
  for (i = 24; i < 36; i++) { 
    scores[i] = scores[i] * 2;
  }

  //TIER 4/D calculations not needed. Each win = 1 point.

  


  // This will be our object to plug data into
  let teamScores = {}

  // Make an object with team name as key, score as val
  for(let i in teams) {
    teamScores[teams[i]] = parseInt(scores[i])
  }

  jsonfile.writeFile(`output/${url.split('.ca/')[1].replace(/\//g,'-')}.json`, teamScores)
  .then(res => {
    console.log('Write complete')
  })
  .catch(error => console.error(error))
}

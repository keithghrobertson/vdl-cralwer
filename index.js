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
  const teams = parsedTable[0]

  // Remove first index cause it's the header
  teams.shift()

  // Get list of score
  const scores = parsedTable[1]

  // Remove first index cause it's the header
  scores.shift()

  // This will be our object to plug data into
  let teamScores = {}

  // Make an object with team name as key, score as val
  for(let i in teams) {
    teamScores[teams[i]] = scores[i]
  }

  jsonfile.writeFile(`output/${url.split('.ca/')[1].replace(/\//g,'-')}.json`, teamScores)
  .then(res => {
    console.log('Write complete')
  })
  .catch(error => console.error(error))
}

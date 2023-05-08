const cheerio = require("cheerio")
const axios = require("axios")

const url=""

async function getClassTable(classUrl){
    try {

        const response = await axios.get(classUrl)
        const $=cheerio.load(response.data)
        const classTable = $("wiki-content-table")

        console.log(classTable)

        classTable.each(function(){
            element = $(this).find()
        })
    }
    catch(error) {
        console.error(error)
    }
}

getClassTable("http://dnd5e.wikidot.com/artificer")
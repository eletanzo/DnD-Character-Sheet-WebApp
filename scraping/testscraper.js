const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")
const { start } = require("repl")

async function getClassData(classUrl) { // "main" method that calls all submethods to grab individual elements from classes
    try {
        const response = await axios.get(classUrl)
        const $ = cheerio.load(response.data)
        getClassTable($)
        getClassHitpoints($)

    }
    catch (error) {
        console.error(error)
    }

}

function getClassHitpoints($) {
    const classHitpointInfo = $("#toc1").next()
    const hitpointText = classHitpointInfo.text()

    startIndex = 0
    hitDice = hitpointText.substring(startIndex, getNextSingleNewLineCharIndex(hitpointText, startIndex))
    startIndex += hitDice.length
    baseHitpoints = hitpointText.substring(startIndex, getNextSingleNewLineCharIndex(hitpointText, startIndex))
    startIndex += baseHitpoints.length
    higherLevelHitpoints = hitpointText.substring(startIndex, getNextSingleNewLineCharIndex(hitpointText, startIndex))

    // console.log(hitDice + " " + baseHitpoints + " " + higherLevelHitpoints)
}

function getClassTable($) { //Scrapes the level up table from a class's page
    const classTable = $("#page-content > table")
    const tableText = classTable.children().text() // Convert to text 
    startIndex = tableText.indexOf("Level\nP")

    let columns = tableText.substring(startIndex, getNextDoubleNewLineCharIndex(tableText, startIndex)) /* Getting column names of tables */
    let columnArray = columns.split("\n")
    startIndex = startIndex + columns.length + 3

    for (let i = 0; i < 20; i++) { //For each level, grab a row of the table
        let level = {}
        let levelDetailsArray = []

        for (let k = 0; k < columnArray.length; k++) { //Grabbing individual element values
            element = tableText.substring(startIndex, getNextSingleNewLineCharIndex(tableText, startIndex))
            if (k == 0) levelDetailsArray.push(element) // If Else statement needed to remove extra newline characters, but not for the first element because of weird web formatting
            else levelDetailsArray.push(element.substring(1, element.length))
            startIndex += element.length
        }
        startIndex += 3

        for (let j = 0; j < columnArray.length; j++) { /* JSON-ifying the results */
            level[columnArray[j] + []] = levelDetailsArray[j] // Adding array to columnArray coerces to string 
        }
        // console.log(level)
    }
}

function getNextDoubleNewLineCharIndex(string, startIndex) { //Returns the index of the next pair of newline characters in a string
    for (let i = startIndex; i < string.length; i++) {
        if (string[i] == "\n" && string[i + 1] == "\n") {
            return i
        }
    }
    return -1
}

function getNextSingleNewLineCharIndex(string, startIndex) { //Returns the index of the next newline character in a string
    for (let i = startIndex + 1; i < string.length; i++) {
        if (string[i] == "\n") {
            return i
        }
    }
    return -1
}

getClassData("http://dnd5e.wikidot.com/wizard")
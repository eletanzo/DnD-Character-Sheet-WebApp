const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")
const { start } = require("repl")

/* Returns a JSON object containing all of the information on a class's wikidot page */
async function getClassData(classUrl) {
    try {
        const response = await axios.get(classUrl)
        const $ = cheerio.load(response.data)
        classJson = {}

        classJson["table"] = getClassTable($)
        classJson["hit points"] = getClassHitpoints($)
        classJson["proficiencies"] = getClassProficiencies($)
        classJson["equipment"] = getClassEquipment($)

        // console.log(classJson)
    }
    catch (error) {
        console.error(error)
    }

}

/* Returns information related to a class's starting equipment as a JSON object */
function getClassEquipment($) {
    const classEquipmentInfo = $("#toc3").next().next()
    let equipmentText = classEquipmentInfo.text()

    equipmentText = equipmentText.substring(1, equipmentText.length)
    let elementCount = 0

    for (let i = 0; i < equipmentText.length; i++) {
        if (equipmentText[i] == "\n") elementCount++
    }

    let equipmentList = []
    let startIndex = 0
    for (let i = 0; i < elementCount; i++) {
        string = equipmentText.substring(startIndex, getNextInstanceOfCharacter(equipmentText, startIndex, "\n"))
        startIndex += string.length

        if (string[0] == "\n") string = string.slice(1) // Removing trailing/starting newlines
        if (string[string.length] == "\n") string = string.slice(0, string.length - 1)

        equipmentList.push(string)
    }

    let equipmentJson = {}
    for (let i = 0; i < equipmentList.length; i++) {
        equipmentJson["Equipment " + (i + 1)] = equipmentList[i]
    }
    // console.log(equipmentJson)

    return equipmentJson
}

/* Returns information related to the class's proficiencies including armor, 
   weapons, tools, saving throws, and skill proficiencies as a JSON object*/
function getClassProficiencies($) {
    const classProficienciesInfo = $("#toc2").next()
    const proficienciesText = classProficienciesInfo.text()
    startIndex = 0

    armorProficiency = proficienciesText.substring(startIndex, getNextInstanceOfCharacter(proficienciesText, startIndex, "\n"))
    startIndex += armorProficiency.length
    weaponProficiency = proficienciesText.substring(startIndex, getNextInstanceOfCharacter(proficienciesText, startIndex, "\n"))
    startIndex += weaponProficiency.length
    toolProficiency = proficienciesText.substring(startIndex, getNextInstanceOfCharacter(proficienciesText, startIndex, "\n"))
    startIndex += toolProficiency.length
    savingThrowProficiency = proficienciesText.substring(startIndex, getNextInstanceOfCharacter(proficienciesText, startIndex, "\n"))
    startIndex += savingThrowProficiency.length
    skillProficiency = proficienciesText.substring(startIndex, proficienciesText.length)

    let proficienciesList = [armorProficiency, weaponProficiency, toolProficiency, savingThrowProficiency, skillProficiency]

    for (let i = 0; i < proficienciesList.length; i++) {
        proficienciesList[i] = proficienciesList[i].substring(getNextInstanceOfCharacter(proficienciesList[i], 0, ":") + 2, proficienciesList[i].length)
    }

    let proficienciesJson = {
        "Armor Proficiency": proficienciesList[0],
        "Weapon Proficiency": proficienciesList[1],
        "Tool Proficiency": proficienciesList[2],
        "Saving Thow Proficiency": proficienciesList[3],
        "Skill Proficiency": proficienciesList[4]
    }
    // console.log(proficienciesJson)

    return proficienciesJson
}

/* Returns information related to class's hitpoints, incuding Hit Dice, Base HP, and HP gain per level as a JSON object */
function getClassHitpoints($) {
    const classHitpointInfo = $("#toc1").next()
    const hitpointText = classHitpointInfo.text()

    startIndex = 0
    hitDice = hitpointText.substring(startIndex, getNextInstanceOfCharacter(hitpointText, startIndex, "\n"))
    startIndex += hitDice.length
    baseHitpoints = hitpointText.substring(startIndex, getNextInstanceOfCharacter(hitpointText, startIndex, "\n"))
    startIndex += baseHitpoints.length
    higherLevelHitpoints = hitpointText.substring(startIndex, getNextInstanceOfCharacter(hitpointText, startIndex, "\n"))

    let hitPointJson = {
        "Hit Dice": hitDice,
        "Base Hit Points": baseHitpoints,
        "Hit Points Per Level": higherLevelHitpoints
    }
    // console.log(hitPointJson)

    return hitPointJson
}

/* Returns the level-up table information as a JSON object*/
function getClassTable($) { //Scrapes the level up table from a class's page
    const classTable = $("#page-content > table")
    const tableText = classTable.children().text() // Convert to text 
    startIndex = tableText.indexOf("Level\nP")

    let columns = tableText.substring(startIndex, getNextDoubleNewLineCharIndex(tableText, startIndex)) /* Getting column names of tables */
    let columnArray = columns.split("\n")
    startIndex = startIndex + columns.length + 3

    let final = {}

    for (let i = 0; i < 20; i++) { //For each level, grab a row of the table
        let levelDetailsArray = []
        let level = {}

        //Creates level object
        for (let k = 0; k < columnArray.length; k++) { //Grabbing individual element values
            element = tableText.substring(startIndex, getNextInstanceOfCharacter(tableText, startIndex, "\n"))
            if (k != 0) levelDetailsArray.push(element.substring(1, element.length))
            else levelDetailsArray.push(element) // If Else statement needed to remove extra newline characters, but not for the first element because of weird web formatting

            startIndex += element.length
        }
        startIndex += 3

        for (let j = 0; j < columnArray.length; j++) { /* JSON-ifying the results */
            level[columnArray[j] + []] = levelDetailsArray[j] // Adding array to columnArray coerces to string 
        }
        // console.log(level)
        final[i + 1] = level
        // console.log(i)
    }
    // console.log(final)

    return final
}

/* Returns the index of the next pair of newline characters in a string */
function getNextDoubleNewLineCharIndex(string, startIndex) {
    for (let i = startIndex; i < string.length; i++) {
        if (string[i] == "\n" && string[i + 1] == "\n") {
            return i
        }
    }
    return -1
}

/* Returns the index of the next isntance of a specified character in a string */
function getNextInstanceOfCharacter(string, startIndex, char) {
    for (let i = startIndex + 1; i < string.length; i++) {
        if (string[i] == char) {
            return i
        }
    }
    return -1
}

getClassData("http://dnd5e.wikidot.com/wizard")
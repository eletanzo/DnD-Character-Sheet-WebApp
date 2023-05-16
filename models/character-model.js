/*
This is a module intended to handle the MongoDB connection with our Character database
and all operations included with that, including authentication, sessions and encryption.
*/
mongoose = require('mongoose')

const CharacterSchema = mongoose.Schema({
    playerName: {
        type: String,
        required: false,
        // trim: true
    },
    name: {
        type: String,
        required: false,
        // trim: true
    },
    race: {
        type: String,
        required: false
    },
    class: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        required: false
    },
    experience: {
        type: Number,
        required: false
    },
    stats: {
        strength: Number,
        dexterity: Number,
        constitution: Number,
        intelligence: Number,
        wisdom: Number,
        charisma: Number
    },
    inventory: {
        type: Array,
        required: false
    },
    equipment: {
        type: Array,
        required: false
    },
    spells: {
        type: Array,
        required: false
    },
    feats: {
        type: Array,
        required: false
    },
    currency: {
        platinum: Number,
        gold: Number,
        electrum: Number,
        silver: Number,
        copper: Number
    },
    health: {
        currentHP: Number,
        maxHP: Number,
        tempHP: Number
    },
    hitDice: {
        remaining: Number,
        max: Number

    },
    savingThrowProficiency: {
        strength: Boolean,
        dexterity: Boolean,
        constitution: Boolean,
        intelligence: Boolean,
        wisdom: Boolean,
        charisma: Boolean
    },
    skillProficiency: {
        acrobatics: Boolean,
        animalHandling: Boolean,
        arcana: Boolean,
        athletics: Boolean,
        deception: Boolean,
        history: Boolean,
        insight: Boolean,
        intimidation: Boolean,
        investigation: Boolean,
        medicine: Boolean,
        nature: Boolean,
        perception: Boolean,
        performance: Boolean,
        persuasion: Boolean,
        religion: Boolean,
        sleightOfHand: Boolean,
        stealth: Boolean,
        survival: Boolean
    },
    skillExpertise: {
        acrobatics: Boolean,
        animalHandling: Boolean,
        arcana: Boolean,
        athletics: Boolean,
        deception: Boolean,
        history: Boolean,
        insight: Boolean,
        intimidation: Boolean,
        investigation: Boolean,
        medicine: Boolean,
        nature: Boolean,
        perception: Boolean,
        performance: Boolean,
        persuasion: Boolean,
        religion: Boolean,
        sleightOfHand: Boolean,
        stealth: Boolean,
        survival: Boolean
    },
    halfProficiency: {
        acrobatics: Boolean,
        animalHandling: Boolean,
        arcana: Boolean,
        athletics: Boolean,
        deception: Boolean,
        history: Boolean,
        insight: Boolean,
        intimidation: Boolean,
        investigation: Boolean,
        medicine: Boolean,
        nature: Boolean,
        perception: Boolean,
        performance: Boolean,
        persuasion: Boolean,
        religion: Boolean,
        sleightOfHand: Boolean,
        stealth: Boolean,
        survival: Boolean
    },
    passivePerception: {
        type: Number,
        required: false
    },
    languages: {
        type: Array,
        required: false
    },
    proficiencies: {
        type: Array,
        required: false
    },
    personalityTraits: {
        type: String,
        required: false
    },
    ideals: {
        type: String,
        required: false
    },
    bonds: {
        type: String,
        required: false
    },
    flaws: {
        type: String,
        required: false
    },
    alignment: {
        type: String,
        required: false
    },
    background: {
        type: String,
        required: false
    },
    armorClass: {
        type: Number,
        required: false
    },
    traits: {
        age : Number,
        height : String,
        weight : String,
        eyes : String,
        skin : String,
        hair : String
    },
    spellSlots: {
        level1: Number,
        level2: Number,
        level3: Number,
        level4: Number,
        level5: Number,
        level6: Number,
        level7: Number,
        level8: Number,
        level9: Number
    },
    spellSlotsUsed: {
        level1: Number,
        level2: Number,
        level3: Number,
        level4: Number,
        level5: Number,
        level6: Number,
        level7: Number,
        level8: Number,
        level9: Number
    },
    spellcasting: {
        spellSaveDC: Number,
        spellAttackBonus: Number,
        spellcastingAbility: String,
        spellcastingClass: String,
        spellcastingLevel: Number,
        spellcastingAbilityModifier: Number,
        spellcastingKnownSpells: Array,
        spellcastingPreparedSpells: Array,
        spellcastingCantrips: Array
    },
    inspiration: {
        type: Boolean,
        required: false
    },
    profBonus: {
        type: Number,
        required: false
    },
    deathSaves: {
        successes: Number,
        failures: Number
    },
    attacks: {
        type: Array,
        required: false
    },
    actions: {
        type: Array,
        required: false
    },
    bonusActions: {
        type: Array,
        required: false
    },
    reactions: {
        type: Array,
        required: false
    },
    legendaryActions: {
        type: Array,
        required: false
    },
    initiative: {
        type: Number,
        required: false
    },
    speed: {
        type: Number,
        required: false
    }
})
module.exports = mongoose.model('Character', CharacterSchema)
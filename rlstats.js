const currentSeasonNumber = "5";
const DUAL_LABEL = "Duel";
const DUAL_CODE = "10";
const DOUBLES_LABEL = "Doubles";
const DOUBLES_CODE = "11";
const SOLO_STANDARD_LABEL = "Solo standard";
const SOLO_STANDARD_CODE = "12";
const STANDARD_LABEL = "Standard";
const STANDARD_CODE = "13";

const TIERS = [
    "Unranked",
    "Bronze I",
    "Bronze II",
    "Bronze III",
    "Silver I",
    "Silver II",
    "Silver III",
    "Gold I",
    "Gold II",
    "Gold III",
    "Platinum I",
    "Platinum II",
    "Platinum III",
    "Diamond I",
    "Diamond II",
    "Diamond III",
    "Champion I",
    "Champion II",
    "Champion III",
    "Grand Champion"
]

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var rls = require('rls-api');
console.log("start");
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
console.log(bot);
var client = new rls.Client({
    token: "1EHZ1R9OLPRWZF1ISGUG1FJAC246VH7B"
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    console.log("bot started");
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 8) == 'rlstats ') {
        var args = message.substring(1).split(' ');
        var playerName = args[1];

        botSendMessages(["  Getting stats for " + playerName + "..."], channelID);
        getPlayerStats(playerName, channelID, showPlayerStats);
    }
});

function getPlayerStats(playerName, channelID, callback) {
    client.getSeasonsData(function (status, data) {
        if (status === 200) {
            data.forEach(function (season) {
                if (season.endedOn == null) {
                    callback(playerName, season.seasonId, channelID);
                }
            });
        }
    });
}

function showPlayerStats(playerName, currentSeasonNumber, channelID) {
    client.getPlayer(playerName, rls.platforms.STEAM, function (status, data) {
        if (status === 200) {
            botSendMessages([
                "   __**" + data.displayName + "**__",
                "",
                getGeneralStats(data),
                "",
                getLevelForCategory(data, STANDARD_LABEL, STANDARD_CODE, currentSeasonNumber),
                getLevelForCategory(data, DOUBLES_LABEL, DOUBLES_CODE, currentSeasonNumber),
                getLevelForCategory(data, DUAL_LABEL, DUAL_CODE, currentSeasonNumber),
                getLevelForCategory(data, SOLO_STANDARD_LABEL, SOLO_STANDARD_CODE, currentSeasonNumber),
            ], channelID);
        } else {
            botSendMessages(["  Player \"" + playerName + "\" not found :confused:"], channelID);
        }
    });
}

function getLevelForCategory(data, category_label, category_code, currentSeasonNumber) {
    var division = data.rankedSeasons[currentSeasonNumber][category_code].division + 1;
    var tier = data.rankedSeasons[currentSeasonNumber][category_code].tier;
    var rankPoints = data.rankedSeasons[currentSeasonNumber][category_code].rankPoints;

    var divisionText = tier > 0 ? " - Division " + division : "";
    var tierText = TIERS[tier];
    var rankPointsText = rankPoints + "pts";
    var categoryText = "**" + category_label + ":**";

    return "   " + categoryText + " " + tierText + divisionText + " | " + rankPoints + " pts";
}

function getGeneralStats(data) {
    var text = "   ";
    text += getGeneralStat("Wins", data.stats.wins);
    text += getGeneralStat("Goals", data.stats.goals);
    text += getGeneralStat("MVPs", data.stats.mvps);
    text += getGeneralStat("Saves", data.stats.saves);
    text += getGeneralStat("Shots", data.stats.shots);
    text += getGeneralStat("Assists", data.stats.assists);
    return text;
}

function getGeneralStat(statLabel, statValue) {
    return "**" + statLabel + ":** " + statValue + "   ";
}

function botSendMessages(messages, channelID) {
    bot.sendMessage({
        to: channelID,
        message: messages.join("\n")
    });
}



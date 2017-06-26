//array index values:
//KD = 0
//Rating = 9
//Win % = 1
//WinCount = 4
//Rounds = 3

const Discord = require('discord.js');
const client = new Discord.Client();
var request = require('request');
var data = {}
var fs = require('fs');
var names = fs.readFileSync('names.txt').toString().split('\r\n');
var counter = 0

//Leadboard Variables
var SoloKD = []
var SoloRatings = []
var SoloWinRatio = []
var SoloWinCount = []
var SoloTotalRounds = []
var DuoKD = []
var DuoRatings = []
var DuoWinRatio = []
var DuoWinCount = []
var DuoTotalRounds = []
var SquadKD = []
var SquadRatings = []
var SquadWinRatio = []
var SquadWinCount = []
var SquadTotalRounds = []

//Static functions ------------------------------------------------------------------------
function callback() {

}

function writeNames() {
    writeString = ""
    for (i in names) {
        if (i == names.length - 1) {
            writeString = writeString.concat(names[i])
            fs.writeFile('names.txt', writeString, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        } else {
            writeString = writeString.concat(names[i] + "\r\n")
        }
    }
}

var printNice = function (array) {
    var promise = new Promise(function (resolve, reject) {
        var totalString = "";
        var count = 1;
        for (index in array) {
            var string = ""
            if (count == array.length) {
                string = count + "th: " + array[index][0] + " - " + array[index][1]
                totalString = totalString + string
                resolve(totalString)
            } else {
                if (count == 1) {
                    string = "1st: " + array[index][0] + " - " + array[index][1]
                    totalString = totalString + string + "\n"
                } else if (count == 2) {
                    string = "2nd: " + array[index][0] + " - " + array[index][1]
                    totalString = totalString + string + "\n"
                } else if (count == 3) {
                    string = "3rd: " + array[index][0] + " - " + array[index][1]
                    totalString = totalString + string + "\n"
                } else {
                    string = count + "th: " + array[index][0] + " - " + array[index][1]
                    totalString = totalString + string + "\n"
                }
                count += 1;
            }
        }
    })
    return promise
}

var dictSort = function (dictionary) {
    var promise = new Promise(function (resolve, reject) {
        var items = Object.keys(dictionary).map(function (key) {
            return [key, dictionary[key]];
        });
        items.sort(function (first, second) {
            return second[1] - first[1];
        });
        resolve(items);
    })
    return promise
}

var APICall = function (name) {
    var promise = new Promise(function (resolve, reject) {
        if (names.indexOf(name) == -1) {
            console.log("not registered, adding")
            console.log(name, names)
            var options = {
                url: 'https://pubgtracker.com/api/profile/pc/' + name,
                headers: {
                    'TRN-Api-Key': 'REDACTED'
                }
            };

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    try {
                        body = JSON.parse(body)
                        fs.writeFile('users/' + name + '.json', JSON.stringify(body, null, 4), callback);
                        names.push(name)
                        console.log("adding " + name)
                        fs.appendFile('names.txt', "\r\n" + name, function (err) {
                            if (err) throw err;
                            console.log('Saved!');
                        });
                        updateAllLBs()
                        resolve("Added")
                    } catch (error) {

                    }
                }
            })
        } else {
            resolve("Already added.")
        }
    });

    return promise
}

function removeUser(name) {
    if (names.indexOf(name) != -1) {
        names.splice(names.indexOf(name), 1);
        updateAllLBs()
        writeNames();
    }
}

//Functions to return specific data -------------------------------------------------------

var getData = function (aname, theMode, arrayIndex) {
    var promise = new Promise(function (resolve, reject) {
        var data = fs.readFile('users/' + aname + '.json', (err, data) => {
            try {
                body = JSON.parse(data)
                if (body.Stats.length == 0) {
                    var array = [];
                    array.push(body["PlayerName"]);
                    array.push(0);
                    resolve(array)
                } else {
                    for (mode in body.Stats) {
                        mode = body.Stats[mode]
                        if (mode.Region == "oc" && mode.Match == theMode) {
                            var array = [];
                            array.push(body["PlayerName"]);
                            array.push(mode.Stats[arrayIndex].value);
                            resolve(array)
                        }
                    }
                }
            } catch (err) {
                resolve("error");
            }
        })
    })
    return promise;
}

//Functions to update leaderboards --------------------------------------------------------

var generateLB = function (theMode, arrayIndex) {
    var promise = new Promise(function (resolve, reject) {
        var lbdict = {};
        for (i in names) {
            var name = names[i]
            getData(name, theMode, arrayIndex).then(function (result) {
                lbdict[result[0]] = result[1]
                if (result[0].toLowerCase() == name) {
                    dictSort(lbdict).then(function (result2) {
                        resolve(result2)
                    });
                }
            })
        }
    })
    return promise;
}

function updateAllLBs() {
    generateLB("solo", 0).then(function (result) {
        SoloKD = result;
    })
    generateLB("solo", 9).then(function (result) {
        SoloRatings = result;
    })
    generateLB("solo", 1).then(function (result) {
        SoloWinRatio = result;
    })
    generateLB("solo", 4).then(function (result) {
        SoloWinCount = result;
    })
    generateLB("solo", 3).then(function (result) {
        SoloTotalRounds = result;
    })
    generateLB("duo", 0).then(function (result) {
        DuoKD = result;
    })
    generateLB("duo", 9).then(function (result) {
        DuoRatings = result;
    })
    generateLB("duo", 1).then(function (result) {
        DuoWinRatio = result;
    })
    generateLB("duo", 4).then(function (result) {
        DuoWinCount = result;
    })
    generateLB("duo", 3).then(function (result) {
        DuoTotalRounds = result;
    })
    generateLB("squad", 0).then(function (result) {
        SquadKD = result;
    })
    generateLB("squad", 9).then(function (result) {
        SquadRatings = result;
    })
    generateLB("squad", 1).then(function (result) {
        SquadWinRatio = result;
    })
    generateLB("squad", 4).then(function (result) {
        SquadWinCount = result;
    })
    generateLB("squad", 3).then(function (result) {
        SquadTotalRounds = result;
    })
}


//Main Loops ------------------------------------------------------------------------------

//Updates the data, iterates through registered users
setInterval(function () {
    if (counter == names.length) {
        counter = 0;
    } else {
        var value = names[counter];
        var options = {
            url: 'https://pubgtracker.com/api/profile/pc/' + value,
            headers: {
                'TRN-Api-Key': 'REDACTED'
            }
        }
        console.log("querying " + value)
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    body = JSON.parse(body)
                    console.log('writing ' + value)
                    fs.writeFile('users/' + value + '.json', JSON.stringify(body, null, 4), callback);
                } catch (error) {

                }
            }
        })

        counter += 1;

    }
}, 5000)

updateAllLBs()
//Updates the leaderboards
setInterval(function () {
    updateAllLBs()
}, 300000);




//Bot instantiation --------------------------------------------------------------------------------- 

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    //name = message.content.slice(9).trim()
    if (message.content.slice(0, 9) === '-pubgadd ') {
        name = message.content.slice(9).trim().toLowerCase()
        APICall(name).then(function (result) {
            message.channel.send(result)
        })

    } else if (message.content.slice(0, 9) === '-pubgdel ') {
        name = message.content.slice(9).trim().toLowerCase()
        removeUser(name);
        message.channel.send("Removing " + name);

    } else if (message.content.slice(0, 8) === '-pubglb ') {
        var leaderboard = message.content.slice(8).trim().toLowerCase();

        if (leaderboard == "solokd") {
            message.channel.send("Here's the current solo KD leaderboard:")
            printNice(SoloKD).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "solowinratio") {
            message.channel.send("Here's the current solo win ratio leaderboard:")
            printNice(SoloWinRatio).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "soloratings") {
            message.channel.send("Here's the current solo ratings leaderboard:")
            printNice(SoloRatings).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "solowincount") {
            message.channel.send("Here's the current solo win count leaderboard:")
            printNice(SoloWinCount).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "solototalrounds") {
            message.channel.send("Here's the current solo total rounds leaderboard:")
            printNice(SoloTotalRounds).then(function (result) {
                message.channel.send("```" + result + "```")
            })
            

        } else if (leaderboard == "duokd") {
            message.channel.send("Here's the current duo KD leaderboard:")
            printNice(DuoKD).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "duoratings") {
            message.channel.send("Here's the current duo ratings leaderboard:")
            printNice(DuoRatings).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "duowinratio") {
            message.channel.send("Here's the current duo win ratio leaderboard:")
            printNice(DuoWinRatio).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "duowincount") {
            message.channel.send("Here's the current duo win count leaderboard:")
            printNice(DuoWinCount).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "duototalrounds") {
            message.channel.send("Here's the current duo total rounds leaderboard:")
            printNice(DuoTotalRounds).then(function (result) {
                message.channel.send("```" + result + "```")
            })
            

        } else if (leaderboard == "squadkd") {
            message.channel.send("Here's the current KD leaderboard:")
            printNice(SquadKD).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "squadratings") {
            message.channel.send("Here's the current squad ratings leaderboard:")
            printNice(SquadRatings).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "squadwinratio") {
            message.channel.send("Here's the current squad win ratio leaderboard:")
            printNice(SquadWinRatio).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "squadwincount") {
            message.channel.send("Here's the current squard win count leaderboard:")
            printNice(SquadWinCount).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else if (leaderboard == "squadtotalrounds") {
            message.channel.send("Here's the current squad total rounds leaderboard:")
            printNice(SquadTotalRounds).then(function (result) {
                message.channel.send("```" + result + "```")
            })
        } else {
            message.channel.send("Error: Invalid leaderboard.")
        }

    } else if (message.content.slice(0, 10) === '-pubghelp') {
        message.channel.send("PUBG Stats Bot by AG7\nOnly retrieves OCE server statistics.\nCommands:\n```-pubghelp: Displays this help menu.\n-pubgadd 'name': Adds user 'name' to the leaderboards and stats retrieval.\n-pubgdel 'name': Removes user 'name' from the leaderboards and stats retrieval.\n-pubgstats 'name' 'stat': Retrieves 'stat' of user 'name'.\n-pubglb 'stat': Displays a leaderboard of 'stat' for all the registered members.\n\nAvalible Stats:\n    SoloKD, SoloRating, SoloWinRatio, SoloWinCount, SoloTotalRounds,\n    DuoKD, DuoRating, DuoWinRatio, DuoWinCount, DuoTotalRounds,\n    SquadKD, SquadRating, SquadWinRatio, SquadWinCount, SquadTotalRounds```\nFor suggestions, complaints and bug reports contact Jono (Verilos).")

    } else if (message.content.slice(0, 10) === '-pubgstats') {
        var nameandstat = message.content.slice(10).trim().toLowerCase();
        var nameandstat = nameandstat.split(" ")
        var name = nameandstat[0]
        var stat = nameandstat[1]

        if (stat == "solokd") {
            getData(name, "solo", 0).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s solo KD is " + result[1]);
                }
            })
        } else if (stat == "solowinratio") {
            getData(name, "solo", 1).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s solo win ratio is " + result[1]);
                }
            })
        } else if (stat == "soloratings") {
            getData(name, "solo", 9).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s solo rating is " + result[1]);
                }
            })
        } else if (stat == "solowincount") {
            getData(name, "solo", 4).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s solo win count is " + result[1]);
                }
            })
        } else if (stat == "solototalrounds") {
            getData(name, "solo", 3).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s solo total rounds is " + result[1]);
                }
            })




        } else if (stat == "duokd") {
            getData(name, "duo", 0).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s duo KD is " + result[1]);
                }
            })
        } else if (stat == "duoratings") {
            getData(name, "duo", 9).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s duo rating is " + result[1]);
                }
            })
        } else if (stat == "duowinratio") {
            getData(name, "duo", 1).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s duo win ratio is " + result[1]);
                }
            })
        } else if (stat == "duowincount") {
            getData(name, "duo", 4).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s duo win count is " + result[1]);
                }
            })
        } else if (stat == "duototalrounds") {
            getData(name, "duo", 3).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s duo total rounds is " + result[1]);
                }
            })




        } else if (stat == "squadkd") {
            getData(name, "squad", 0).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s squad KD is " + result[1]);
                }
            })
        } else if (stat == "squadratings") {
            getData(name, "squad", 9).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s squad rating is " + result[1]);
                }
            })
        } else if (stat == "squadwinratio") {
            getData(name, "squad", 1).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s squad win ratio is " + result[1]);
                }
            })
        } else if (stat == "squadwincount") {
            getData(name, "squad", 4).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s squad win count is " + result[1]);
                }
            })
        } else if (stat == "squadtotalrounds") {
            getData(name, "squad", 3).then(function (result) {
                if (result == "error") {
                    message.channel.send("Please register this name with -pubgadd 'name' first.")
                } else {
                    message.channel.send(result[0] + "'s squad total rounds is " + result[1]);
                }
            })
        } else {
            message.channel.send("Error: Invalid stat.")
        }

    } else if (message.content.slice(0, 5) === '-pubg') {
        message.channel.send("Error: Invalid command/format.")

    }
});




client.login("REDACTED");

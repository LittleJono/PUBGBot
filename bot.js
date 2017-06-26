const Discord = require('discord.js');
const client = new Discord.Client();
var request = require('request');
var data = {}
var fs = require('fs');
var lbdict = {};
var finishedLB = {};
var asyncr = require('async');

var names = fs.readFileSync('names.txt').toString().split('\r\n');
var counter = 0

var ratings = [];
var ratingnames = [];
var finishedRatings = [];
var finishedRatingNames = [];

console.log(names);

function callback() {

}

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



generateSoloLB()
setTimeout(function () {
    finishedLB = lbdict;
    dictSort();
}, 5000);
setInterval(function () {
    generateSoloLB()
    setTimeout(function () {
        finishedLB = lbdict;
        dictSort();
    }, 5000);
}, 300000);

function generateSoloLB() {
    lbdict = {};
    for (i in names) {
        var name = names[i]
        getSoloRating(name);
    }

}

function getSoloRating(aname) {
    var data = fs.readFile('users/' + aname + '.json', (err, data) => {
        if (err) throw err;
        body = JSON.parse(data)
        for (mode in body.Stats) {
            mode = body.Stats[mode]
            if (mode.Region == "oc" && mode.Match == "solo") {
                lbdict[body["PlayerName"]] = mode.Stats[9].value
            }
        }
    });
}


function dictSort() {
    ratings = [];
    ratingnames = [];
    for (key in finishedLB) {
        dictSort2(key)
    }

    setTimeout(function () {
        console.log(ratings);
        console.log(ratingnames);
        finishedRatingNames = ratingnames.reverse()
        finishedRatings = ratings.reverse()
    }, 3000);
}

function dictSort2(key) {
    var counting = 0
    for (key2 in finishedLB) {
        if (key == key2) {
            callback()
        } else {
            if (finishedLB[key] > finishedLB[key2]) {
                counting += 1
            }
        }
    }
    setTimeout(function () {
        ratings[counting] = finishedLB[key]
        ratingnames[counting] = key
    }, 2000)
}

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    name = message.content.slice(6).trim()
    if (message.content.slice(0, 6) === '-pubg ') {
        if (names.indexOf(name) == -1) {
            console.log("not registered, adding")
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
                        for (mode in body.Stats) {
                            mode = body.Stats[mode]
                            if (mode.Region == "oc" && mode.Match == "solo") {
                                message.channel.send(name + "'s KD on OCE in solo is " + mode.Stats[0].value);
                            }
                        }
                        fs.writeFile('users/' + name + '.json', JSON.stringify(body, null, 4), callback);
                        names.push(name)
                        console.log("adding " + name)
                        fs.appendFile('names.txt', "\r\n" + name, function (err) {
                            if (err) throw err;
                            console.log('Saved!');
                        });
                        generateSoloLB()
                        setTimeout(function () {
                            finishedLB = lbdict;
                            dictSort();
                        }, 5000);
                    } catch (error) {

                    }
                }
            })
        } else {
            fs.readFile('users/' + name + '.json', (err, data) => {
                if (err) throw err;
                body = JSON.parse(data)
                for (mode in body.Stats) {
                    mode = body.Stats[mode]
                    if (mode.Region == "oc" && mode.Match == "solo") {
                        message.channel.send(name + "'s KD on OCE in solo is " + mode.Stats[0].value);
                    }
                }
            });
        }
    }
    if (message.content.slice(0, 7) === '-pubglb') {
        message.channel.send("Here's the current OC Solo leaderboard:")
        sendstring = "```"
        for (number in finishedRatings) {
            console.log(sendstring)
            sendstring = sendstring.concat(finishedRatingNames[number] + "- " + finishedRatings[number] + '\n')
        }
        setTimeout(function () {
            sendstring = sendstring.concat("```")
            message.channel.send(sendstring)
        }, 100)
    }
});
client.login('REDACTED');

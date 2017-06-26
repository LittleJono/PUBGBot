const Discord = require('discord.js');
const client = new Discord.Client();
var request = require('request');
var data = {}
var fs = require('fs');
var names = fs.readFileSync('names.txt').toString().split('\r\n');
var counter = 0

//Leadboard Variables
var OCESoloRatings = []

//Static functions ------------------------------------------------------------------------
function callback() {

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
                        for (mode in body.Stats) {
                            mode = body.Stats[mode]
                            if (mode.Region == "oc" && mode.Match == "solo") {
                                var array = []
                                array.push(name)
                                array.push(mode.Stats[0].value)
                                resolve(array)
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
                        var array = []
                        array.push(name)
                        array.push(mode.Stats[0].value)
                        resolve(array)
                    }
                }
            });
        }
    });

    return promise
}

//Functions to return specific data -------------------------------------------------------

var getSoloRating = function (aname) {
    var promise = new Promise(function (resolve, reject) {
        var data = fs.readFile('users/' + aname + '.json', (err, data) => {
            if (err) throw err;
            body = JSON.parse(data)
            if (body.Stats.length == 0) {
                var array = [];
                array.push(body["PlayerName"]);
                array.push(0);
                resolve(array)
            } else {
                for (mode in body.Stats) {
                    mode = body.Stats[mode]
                    if (mode.Region == "oc" && mode.Match == "solo") {
                        var array = [];
                        array.push(body["PlayerName"]);
                        array.push(mode.Stats[9].value);
                        resolve(array)
                    }
                }
            }
        })
    })
    return promise;
}


//Functions to update leaderboards --------------------------------------------------------

function generateSoloLB() {
    var lbdict = {};
    for (i in names) {
        var name = names[i]
        getSoloRating(name).then(function (result) {
            lbdict[result[0]] = result[1]
            if (result[0].toLowerCase() == name) {
                dictSort(lbdict).then(function (result2) {
                    OCESoloRatings = result2;
                    console.log(OCESoloRatings)
                });
            }
        });
    }
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


generateSoloLB()
//Updates the leaderboards
setInterval(function () {
    generateSoloLB()
}, 300000);




//Bot instantiation --------------------------------------------------------------------------------- 

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    name = message.content.slice(6).trim()
    if (message.content.slice(0, 6) === '-pubg ') {
        APICall(name).then(function (result) {
            message.channel.send(result)
        })
    }
    if (message.content.slice(0, 7) === '-pubglb') {
        message.channel.send("Here's the current OC Solo leaderboard:")
        message.channel.send(OCESoloRatings)
    }
});




client.login('REDACTED');

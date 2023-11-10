const schemas = require('../models/schemas')
const mongoose = require('mongoose')
const express = require('express');
const { useBeforeUnload } = require('react-router-dom');

//const create_user = await import("../routes/CreateUser")

function formatDate(string){
    var options = { year: 'numeric', month: 'long', day: 'numeric', day: "2-digit"};
    return new Date(string).toLocaleDateString("en-SG",options);
}
function formatTime(string){
    var options = { hour: "2-digit", minute: "2-digit"};
    return new Date(string).toLocaleTimeString("SG", options)
}
function sortDate(date_array) {date_array.sort((a,b) =>  Date.parse(a) - Date.parse(b))}
function sortTime(time_array) {time_array.sort(function (a, b) {
    return a.localeCompare(b);
})}
function sortISOdt(ISOdt) {ISOdt.sort(function(a, b) {
    return (a < b) ? -1 : ((a > b) ? 1 : 0);
})}
function newMeetdt(meetDT) {
    const formattedDT = []
    meetDT.forEach(DT => {
        let d = new Date(DT);
        d.setSeconds(0,0);
        formattedDT.push(d.toISOString());
    })
    return formattedDT;
}

const updateGroupDetails = async(groupID) => { // based on latest group info, update as in the votes and all, maybe location too
    const group = await schemas.Groups.findOne({"groupID": groupID});
    const users = await schemas.Users.find({"groupID": groupID});
    //console.log(users)

    /*
    // update central location
    let overall_lat = 0;
    let overall_lon = 0;
    users.forEach(user =>{
        //console.log(user)
        overall_lat += user.location.LatLon.Lat;
        overall_lon += user.location.LatLon.Lon;
    })
    const numMems = users.length
    const group_lat = overall_lat/numMems
    const group_lon = overall_lon/numMems
    group.centralLocation.LatLon.Lat = group_lat;
    group.centralLocation.LatLon.Lon = group_lon;
    */

    // update dates vote
    const days = group.meetDateTime.length
    let dates_votes = [...group.datesVote];
    for (let reset = 0; reset < days; reset ++) {dates_votes[reset] = 0;}
    let dtIndexer = 0;
    group.meetDateTime.forEach(DayTime => {
        users.forEach(user => {
            /*
            console.log(user.meetDateTime)
            console.log(user.meetDateTime[0])
            console.log(DayTime)
            console.log(user.meetDateTime.includes(DayTime))
            console.log(user.meetDateTime[0] == DayTime)
            console.log(user.meetDateTime[0] === DayTime)
            console.log(user.meetDateTime[0].toISOString() === DayTime.toISOString())
            console.log(user.meetDateTime[0].toISOString())
            console.log(DayTime.toISOString())
            if (user.meetDateTime.includes(DayTime)){
                console.log("BITCH")
                dates_votes[dtIndexer] = dates_votes[dtIndexer] + 1;
                // only have the date once! but includes check whole thing so oh well!!
            }
            */
            if (user.meetDateTime.some((Udate) => {return Udate.toISOString() === DayTime.toISOString();})){
                //console.log("BITCH")
                dates_votes[dtIndexer] = dates_votes[dtIndexer] + 1;
            }
        })
        dtIndexer += 1;
        //console.log(dates_votes)
        //console.log(dtIndexer)
    })
    group.datesVote = dates_votes;
    await group.save();
}

exports.updateGroupDetails = async(groupID) => { // based on latest group info, update as in the votes and all, maybe location too
    const group = await schemas.Groups.findOne({"groupID": groupID});
    const users = await schemas.Users.find({"groupID": groupID});
    const days = group.meetDateTime.length
    let dates_votes = [...group.datesVote];
    for (let reset = 0; reset < days; reset ++) {dates_votes[reset] = 0;}
    let dtIndexer = 0;
    group.meetDateTime.forEach(DayTime => {
        users.forEach(user => {
            if (user.meetDateTime.some((Udate) => {return Udate.toISOString() === DayTime.toISOString();})){
                dates_votes[dtIndexer] = dates_votes[dtIndexer] + 1;
            }
        })
        dtIndexer += 1;
    })
    console.log(dates_votes)
    group.datesVote = dates_votes;
    console.log(group)
    await group.save();
    /*
    let loop = true
    while(loop){
        try {
            await group.save();
            loop = false;
        }
        catch (e) {console.log("TRYING AGAIN")}
    }
    */
}

async function sendUserInfo(user_address, user_datetime, user_groupID, Gleader) {
    const userInfoData = {
        "UserData" : user_address,
        "UserDT" : user_datetime,
        "UserGroupID": user_groupID,
        "Leader": Gleader
    }
    //console.log(userInfoData)
    const response = await fetch(process.env.URL + "/CreateUser", {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userInfoData)
    }).then((response) => response.json()) //recerving HTML but parsing json, need fix!
    //console.log(response)
    return response;
}

// CREATE GROUP
exports.createGroup = async(req, res) => {
    console.log(req.body)
    //res.send({"a": "b"}) // temp

    let groupCode = Math.random().toString(36).substring(2,7).toUpperCase();
    let codeExists = await schemas.Groups.findOne({groupCode: groupCode});

    while (codeExists) {
        groupCode = Math.random().toString(36).substring(2,7).toUpperCase();
        codeExists = await schemas.Groups.findOne({groupCode: groupCode});
    }

    let groupId = 0
    let IdExists = await schemas.Groups.findOne({groupID: groupId});
    while (IdExists) {
        console.log(IdExists);
        groupId = groupId + 1;
        IdExists = await schemas.Groups.findOne({groupID: groupId});
    }
    //console.log(" THE GROUP ID ISSS"+groupId);
    /*
    if (req.body.meetDateTime == undefined || req.body.meetDateTime.length < 1) {
        res.status(400).send('Invalid Group Details');
        res.end()
        return
    }
    */
    const groupDateTimeInfo = newMeetdt(req.body.meetDateTime)
    // remove duplicate dates... add next time...
    sortISOdt(groupDateTimeInfo)

    const user_info = await sendUserInfo(req.body.userData, groupDateTimeInfo, groupId, true);
    console.log("A")
    console.log(user_info)
    console.log("B")
    console.log(groupDateTimeInfo.length)
    const num_possible_dates = groupDateTimeInfo.length;
    const datesV = [];
    for (let iniAr = 0; iniAr < num_possible_dates; iniAr++){datesV.push(1);}

    const newGroup = new schemas.Groups({
        groupID: groupId,
        groupName: req.body.groupName,
        groupCode: groupCode,
        meetDateTime: groupDateTimeInfo,
        groupUsers: [user_info.userID],
        datesVote: datesV,
        centralLocation: {
            LatLon: {
                Lat: user_info.location.LatLon.Lat,
                Lon: user_info.location.LatLon.Lon
            }
        }
    })
    console.log(newGroup);

    try {
        const saveGroup = await newGroup.save()
        if (saveGroup) {
            console.log(newGroup)
            console.log("saved group!")
            res.send(newGroup)
        }
        console.log("group created")
    } catch (error) {
        res.status(400).send('Invalid Group Inputs')
    }
    
    res.end()
}

// redirects should be code 300+... so yaeaaa...

// JOIN GROUP: check if group exists, and send it
exports.getGroupFromCode = async(req, res) => {
    //res.send({"code(URL FOR NOW)":req.url});
    //return;
    //const groupCode = req.params.groupCode
    const groupCode = req.body.groupCode.toUpperCase();
    if (groupCode.length !== 5) {
        res.status(400).send(JSON.stringify({message: 'Please enter a valid group code!'}))
    } else {
        const group = await schemas.Groups.findOne({groupCode: groupCode})
        if (group== null) {res.status(400).send(JSON.stringify({message: 'Please enter a valid group code!'})); return;}
        res.send(group)
    }
}

exports.GroupLayout = async(req, res) => {
    if ((req==null) || (req.body.groupID == null) || (req.body.userID == null)) {res.status(302).send(JSON.stringify({message: 'No Group(cache gone)'})); return;}
    //console.log(req)
    //console.log(req.body)
    const response_U = await fetch(process.env.URL + "/GroupLayout/GetUser", {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"userID" : req.body.userID, "groupID" : req.body.groupID})
    }).then((response) => response.json())

    const response_G = await fetch(process.env.URL + "/GroupLayout/GetGroup", {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"groupID" : req.body.groupID})
    }).then((response) => response.json()) //recerving HTML but parsing json, need fix!

    const INFOs = {
        "Uinfo" : response_U,
        "Ginfo" : response_G
    }

    //console.log(INFOs);
    res.send(INFOs);
}

// get group info
exports.getGroupFromID = async(req, res) => {
    const groupID = req.body.groupID;
    const group = await schemas.Groups.findOne({"groupID": groupID});
    res.send(group);
}

exports.addUserToGroup = async(req, res) => {
    const groupID = req.body.UserGroupID;
    const timingInfo = newMeetdt(req.body.UserDT);
    // remove duplicate dates... add next time...
    sortISOdt(timingInfo)
    const user_info = await sendUserInfo(req.body.UserData, timingInfo, groupID, false);
    //console.log(user_info)
    const updateGroup = await schemas.Groups.findOne({"groupID": groupID});
    updateGroup.groupUsers.push(user_info.userID)
    await updateGroup.save()

    await updateGroupDetails(groupID);
    const g = await schemas.Groups.findOne({"groupID": groupID});
    console.log(g)
    /*
    const times = updateGroup.meetDateTime
    let dtVote = updateGroup.datesVote
    for (let v = 0; v < times.length; v++){
        //console.log(timingInfo)
        if (timingInfo.includes(times[v])) {dtVote[v] += 1;}
    }
    console.log(dtVote);
    updateGroup.datesVote = dtVote;
    //console.log(updateGroup);
    await updateGroup.save();
    //res.send(group);

    console.log(user_info.meetDateTime)
    console.log(updateGroup.meetDateTime)
    */
    res.send(user_info)
    MostVotedMDT_Leader(groupID)
}

///////////////////////////////////////////////////////////////////////

function getCid(GHclients) {
    return GHclients.id;
}
let grouphome_clients = [];
//exports.grouphome_clients;
exports.getRTGroupUsers_MDT = async(req, res) => {
    console.log(req.params)
    console.log(req.params.GroupID)
    if (req.params.GroupID === ":") {console.log(": !!!"); res.status(400).send("Invalid Group ID!!"); return;}
    const groupId = Number(req.params.GroupID.slice(1,));
    console.log(groupId);

    // need check from here onwards... but need change the head that was sent here...
    if (isNaN(groupId)) {console.log("NaN !!!"); res.status(400).send("Invalid Group ID!!"); return;}
    else{
        console.log(grouphome_clients);
        const users = await schemas.Users.find({groupID: groupId});
        //try {res.status(400).send("Invalid Group Code!!");} catch (error) {res.status(400).send('Invalid Group Code!!'); return;}
        if (users.length == 0) {console.log("No Such Group ID !!!!"); res.status(400).send("Invalid Group ID!!"); return;}
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            "Access-Control-Allow-Origin": "*"
        };
        res.writeHead(200, headers);
        //const zhei_en = "shitty"
        //const data = `data: ${JSON.stringify(users)} pie:${zhei_en}\n\n`;
        const MostVotedMDTList = await MostVotedMDT_Leader(groupId)
        console.log(MostVotedMDTList)
        const to_send = {
            "groupUsersData": users,
            "MostVotedMDT": MostVotedMDTList
        }
        const data = `data: ${JSON.stringify(to_send)}\n\n`;
        res.write(data);
        const clientId = Date.now() + "_" + groupId// + '-' + Math.floor(Math.random() * 1000000000); // need unique clients to group too! so dont sned to diff groups, so need fact check before send all!!
        const newClient = {
            id: clientId,
            res
        }
        console.log(`NEW CLIENT OF CLIENT ID: ${clientId}, GROUP ID: ${groupId}`)
        //console.log(grouphome_clients)
        grouphome_clients.push(newClient);
        //console.log(grouphome_clients)
        console.log("clients currently are: "+grouphome_clients.map(getCid))
        req.on('close', () => {
            console.log(`Client ${clientId} Connection Closed`)
            grouphome_clients = grouphome_clients.filter(client => client.id !== clientId);
        });
    }
    
}

async function MostVotedMDT_Leader(groupID){ // consider Leader need to vote the date too
    //if (grouphome_clientss === undefined){grouphome_clientss = grouphome_clients;}
    console.log("MV_MDT_L: clients currently are: "+grouphome_clients.map(getCid))
    ////console.log(groupID)
    const leader = await schemas.Users.findOne({groupID: groupID, leader:true});
    //console.log(leader.meetDateTime + "POOPY")
    //return;
    ////console.log(leader)
    const leaderMDT = leader.meetDateTime; // an array of MDT
    //console.log("HI1")
    console.log(leader)
    //console.log("HI2")
    console.log(leaderMDT)
    const group = await schemas.Groups.findOne({"groupID": groupID});
    const groupMDT = group.meetDateTime;  // an array of MDT
    const groupDatesVote = group.datesVote; // array of votes for each MDT

    /*
    console.log("A")
    console.log(groupMDT)
    console.log(groupDatesVote)
    console.log("B")

    console.log(groupMDT)
    console.log(leaderMDT)
    console.log(groupMDT[0] === leaderMDT[0])
    console.log(groupMDT[0], leaderMDT[0])
    */

    console.log("GDV"+groupDatesVote)

    const useleaderMDT = leaderMDT.map((mdt) => {return mdt.toISOString();})
    const usegroupMDT = groupMDT.map((mdt) => {return mdt.toISOString();})
    console.log(useleaderMDT)
    console.log(usegroupMDT)

    const IndexesOfLeaderMDT = []
    let maxVotedVoteCount = 0;
    useleaderMDT.forEach((singleMDT) => {
        const mdt_index = usegroupMDT.indexOf(singleMDT)
        //console.log(mdt_index)
        if (mdt_index != -1) { // if is -1 then not in the leader's MDT then ignore!!
            IndexesOfLeaderMDT.push(mdt_index);
            if (groupDatesVote[mdt_index] > maxVotedVoteCount) {maxVotedVoteCount = groupDatesVote[mdt_index];}
        }
    })

    //console.log(IndexesOfLeaderMDT);
    //console.log(maxVotedVoteCount);
    
    const final_MDTs = []
    IndexesOfLeaderMDT.forEach((consideringIndex) => {
        if (groupDatesVote[consideringIndex] == maxVotedVoteCount) {final_MDTs.push(usegroupMDT[[consideringIndex]])}
    })

    console.log(final_MDTs)
    return final_MDTs;
}

const sendMemberInfoChangeEventsToAllHome = async(groupId) => {
    console.log("sending home info!")
    console.log("clients are " + grouphome_clients) /////////////////////
    const group_users = await schemas.Users.find({groupID: groupId});
    const MostVotedMDTList = await MostVotedMDT_Leader(groupId)
    console.log(MostVotedMDTList)
    const to_send = {
        "groupUsersData": group_users,
        "MostVotedMDT": MostVotedMDTList
    }

    console.log("GOING TO SEND: "+to_send)
    console.log("GOING TO SEND: "+to_send.groupUsersData)
    console.log("GOING TO SEND: "+to_send.MostVotedMDT)

    //const data = `data: ${JSON.stringify(to_send)}\n\n`;
    //const data = `${JSON.stringify(to_send)}\n\n`;
    //res.write(data);
    grouphome_clients.forEach((client) => {
        const c_id = client.id; //need make to string so can use slice? `${client.id}` can!!, but no need!!!
        console.log(`ITS ${c_id}`)
        const _index = c_id.search("_");
        const GroupID = client.id.slice(_index+1, );
        if (GroupID == groupId) {
            client.res.write('event: message\n'); // need this to trigger "onmessage"!! TO NOTE!!!
            //client.res.write(`GroupMembersInfo: ${JSON.stringify(group_users)}`); // CANNOT SIA.... // TO NOTE!! NEED "data" specifcally for key!!
            client.res.write(`data: ${JSON.stringify(to_send)}`);
            console.log("SENT: "+to_send)
            client.res.write("\n\n");
        }
    });
}

exports.sendMemberInfoChangeEventsToAllHome = async(groupId) => {
    console.log("sending home info!")
    console.log("clients are " + grouphome_clients)
    const group_users = await schemas.Users.find({groupID: groupId});
    const MostVotedMDTList = await MostVotedMDT_Leader(groupId)
    console.log(MostVotedMDTList)
    const to_send = {
        "groupUsersData": group_users,
        "MostVotedMDT": MostVotedMDTList
    }

    console.log("GOING TO SEND: "+to_send)
    console.log("GOING TO SEND: "+to_send.groupUsersData)
    console.log("GOING TO SEND: "+to_send.MostVotedMDT)

    grouphome_clients.forEach((client) => {
        const c_id = client.id;
        console.log(`ITS ${c_id}`)
        const _index = c_id.search("_");
        const GroupID = client.id.slice(_index+1, );
        if (GroupID == groupId) {
            client.res.write('event: message\n');
            client.res.write(`data: ${JSON.stringify(to_send)}`);
            console.log("SENT: "+to_send)
            client.res.write("\n\n");
        }
    });
}

exports.setChosenDetails = async(req,res) => {
    const group_id = req.body.GroupID
    const chosen_mdt = req.body.ChosenMDT
    const group = await schemas.Groups.findOne({"groupID": group_id})
    group.chosenMDT = chosen_mdt
    const group_users = await schemas.Users.find({"groupID": group_id})
    const activity_users = []
    group_users.forEach(user => {
        const user_mdt_string = user.meetDateTime.map(mdt => mdt.toISOString())
        if (user_mdt_string.includes(chosen_mdt)){activity_users.push(user)}
    })
    // among the users part of the selected MeetDateTime
    let central_lat = 0
    let central_lon = 0
    const num_activity_users = activity_users.length
    activity_users.forEach((activity_user) =>{
        central_lat += activity_user.location.LatLon.Lat
        central_lon += activity_user.location.LatLon.Lon
    })
    central_lat /= num_activity_users
    central_lon /= num_activity_users
    group.centralLocation.LatLon.Lat = central_lat
    group.centralLocation.LatLon.Lon = central_lon
    console.log(group)

    await group.save()
    res.send()
    res.end()
}

 // FOR PERSISTENT CONNECTION SO UPDATE WHEN GOT NEW MEMBER! THIS ONE NEED INCORPORATE!!
// sse for NameBox
let clients = [];
exports.getUsersFromGroupID = async(req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const groupID = req.params.groupID
    const group = await schemas.Groups.findOne({_id: groupID})
    console.log('controllers/group.js getUsersFromGroupID group: ' + group)
    res.write('data: ' + JSON.stringify(group) + '\n\n');

    // creating a unique client ID
    const clientID = Date.now() + '-' + Math.floor(Math.random() * 1000000000);
    const newClient = {
        id: clientID,
        res,
    };

    clients.push(newClient);
    console.log(`${clientID} - Connection opened`);
    sendToAllUsers(groupID)

    req.on('close', () => {
        console.log(`${clientID} - Connection closed`);
        clients = clients.filter(client => client.id !== clientID);
    });
}

const sendToAllUsers = (async(groupID) => {
    const group = await schemas.Groups.findOne({_id: groupID})
    for(let i=0; i<clients.length; i++){
        clients[i].res.write('data: ' + JSON.stringify(group) + '\n\n');
    }
})

// sse to handle voting
let votingClients = [];
exports.startVoting = async(req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const groupID = req.params.groupID

    // get group
    const group = await schemas.Groups.findOne({_id: groupID})
    res.write('data: '  + JSON.stringify(group) + '\n\n');

    // creating a unique client ID
    const clientID = Date.now() + '-' + Math.floor(Math.random() * 1000000000);
    const newClient = {
        id: clientID,
        res,
    };

    votingClients.push(newClient);
    console.log(`${clientID} - Connection opened`);

    req.on('close', () => {
        console.log(`${clientID} - Connection closed`);
        votingClients = votingClients.filter(client => client.id !== clientID);
    });
}

// post a vote
exports.vote = async(req, res) => {
    const group = await schemas.Groups.findOne({_id: req.body.groupID})
    let votes = group.votes
    let idx = req.body.idx
    const vote = req.body.vote

    if (vote) {
        votes.splice(idx, 1, votes[idx] + 1);
        await schemas.Users.findOneAndUpdate(
            {_id: req.body.userID},
            {voted : idx}
        )
    } else {
        votes.splice(idx, 1, votes[idx] - 1);
        await schemas.Users.findOneAndUpdate(
            {_id: req.body.userID},
            {voted : -1}
        )
    }
    const user = await schemas.Users.findOne({_id: req.body.userID});

    await group.updateOne({votes : votes})
    console.log('controllers/group.js vote: (group)\n' + JSON.stringify(group))
    console.log('controllers/group.js vote: (user)\n' + JSON.stringify(user))
    sendVoteToAllUsers(group, votes)
    res.send(votes)
    res.end()
}

const sendVoteToAllUsers = (async(group, votes) => {
    for(let i=0; i<votingClients.length; i++){
        votingClients[i].res.write('data: ' + JSON.stringify(group) + '\n\n');
    }
})

exports.clearLoadedData = async(req, res) => {
    const group = await schemas.Groups.findOne({_id: req.params.gID});
    group.chosenDateTimeIndex = -1;
    group.activityList = undefined;
    group.centralLocation = undefined;
    await group.save();
    console.log('cleared loaded data: ' + group)
    res.send(group);
}
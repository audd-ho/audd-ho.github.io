const schemas = require('../models/schemas')
const mongoose = require('mongoose')
const express = require('express')
const GroupController = require('./group')

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


// CREATE USER
exports.createUser = async(req, res) => {
    //const group = await schemas.Groups.findOne({_id: req.body.groupID});
    //if (!req.body._id) {
        // console.log('c/user 21 ' + group.leader + '\n')
    //console.log(req.body)
    let UserId = 0 // start from 0 like indexing!!
    const curGroupUsers = await schemas.Users.find({groupID: req.body.UserGroupID});
    //console.log("HI1")
    //console.log(uIdExists);
    //console.log("HI2")

    ///console.log("HI1")
    ///console.log(curGroupUsers)
    ///console.log("HI2")
    const grplen = curGroupUsers.length;
    const curGroupIds = [];
    for (let kk = 0; kk < grplen; kk++){
        curGroupIds.push(curGroupUsers[kk].userID)
    }
    console.log(curGroupIds)
    for (; UserId < grplen; UserId++){
        if (!(curGroupIds.includes(UserId))) {break;}
    }

    ///const UserTimingInfo = newMeetdt(req.body.UserDT);
    const UserTimingInfo = [...req.body.UserDT];
    // remove duplicate dates... add next time...
    sortISOdt(UserTimingInfo)
    console.log("HERE")
    console.log(UserTimingInfo)
    console.log(sortISOdt(UserTimingInfo))
    const newUser = new schemas.Users({
        userID: UserId,
        groupID: req.body.UserGroupID,
        name: req.body.UserData.Name,
        leader: req.body.Leader,
        meetDateTime: UserTimingInfo,
        location: {
            LatLon: {
                Lat: req.body.UserData.LatLon.Lat, Lon: req.body.UserData.LatLon.Lon
            }, // dictionary
            AddressName: req.body.UserData.AddressName
        }
    })
    //console.log("HI1")
    ////console.log(newUser);
    //console.log("HI2")
    //res.send({"a":"b"})

    const saveUser = await newUser.save()
    if (saveUser) {
        console.log("saved user!")
        // REAL REASON FOR CRASH IS THIS 2... IDK THE SEND OR THE END, SHOULD BE SEND, COS ONCE FRONTEND RECEIVE SEND THEN IT WILL NAVIGATE THEN REQUEST FOR GROUP DETAILS AND ETC WHICH WILL CAUSE RACE CONDITION COS STILL UPDATING BELOW!! SIMULTANEOUSLY
        /*
        res.send(newUser)
        res.end()
        */
        //console.log("A")
        await GroupController.updateGroupDetails(req.body.UserGroupID) // need await? // somehow got race condition here... idgi but yeaaa...
        // THE RES.SEND() NEED TO BE BELOW OR ELSE THE GROUP DETAILS SAVING WILL CAUSE RACE CONDITION!!!
        res.send(newUser)
        res.end()        
        //console.log("B")
        // THE BELOW ONE NO CARE COS THEY NO SAVING, ONLY RETRIEVING INFO, SO NO WRITING OF DATA, DATA NOT CHANGING, ITS FIXED SO READ 1000X ALSO OK!!
        sendNewMemberEventsToAll(req.body.UserGroupID);
        //console.log("C")
        GroupController.sendMemberInfoChangeEventsToAllHome(req.body.UserGroupID);
    }
    
    //await sendNewMemberEventsToAll(req.body.UserGroupID);
    //await GroupController.sendMemberInfoChangeEventsToAllHome(req.body.UserGroupID);\

    // not too sure yet why but put outside here then mongodb will crash due to version control... race condition... but got await tho...
    // but yeaaa... the updateGroupDetails the group.save() in it will cause a crash... idk why...
    /*
    //console.log("A")
    await GroupController.updateGroupDetails(req.body.UserGroupID) // need await? // somehow got race condition here... idgi but yeaaa...
    res.send(newUser)
    res.end()
    //console.log("B")
    sendNewMemberEventsToAll(req.body.UserGroupID);
    //console.log("C")
    GroupController.sendMemberInfoChangeEventsToAllHome(req.body.UserGroupID);
    */
    return;
    if (newUser.leader) {
        await group.updateOne({leader: newUser._id});
    }
    // all members (including leader) is put into the members list
    group.members.push(newUser._id);
    await group.save();
    console.log(await schemas.Groups.findOne({_id: req.body.groupID}))
    console.log('user added: ' + newUser)
    /*
    } else {
        const user = await schemas.Users.findOne({_id: req.body._id});
        await user.updateOne({
            name: req.body.name,
            location: {
                type: 'Point',
                coordinates: req.body.coordinates,
                formattedAddress: req.body.formattedAddress
            }
        })
        console.log('user updated: ' + user)
        res.send(user)
    }
    */
    res.end()
}

//
exports.getGroupUsers = async(req, res) => {
    const groupId = req.body.groupId;
    const users = await schemas.Users.find({groupID: groupId});
    res.send(users);
}

let clients = []
exports.getRTGroupUsers = async(req, res) => {
    console.log(req.params)
    console.log(req.params.GroupID)
    if (req.params.GroupID === ":") {console.log(": !!!"); res.status(400).send("Invalid Group ID!!"); return;}
    const groupId = Number(req.params.GroupID.slice(1,));
    console.log(groupId);
    if (isNaN(groupId)) {console.log("NaN !!!"); res.status(400).send("Invalid Group ID!!"); return;}
    else{
        console.log(clients);
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
        //const data = `GroupMembersInfo: ${JSON.stringify(users)}\n\n`; // cant write liddat too!!
        //res.write(data); technically no need!! so yeaa!!
        const clientId = Date.now() + "_" + groupId// + '-' + Math.floor(Math.random() * 1000000000); // need unique clients to group too! so dont sned to diff groups, so need fact check before send all!!
        const newClient = {
            id: clientId,
            res
        }
        console.log(`NEW CLIENT OF CLIENT ID: ${clientId}, GROUP ID: ${groupId}`)
        //console.log(clients)
        clients.push(newClient);
        //console.log(clients)
        console.log(clients.forEach(c => c.clientId))
        req.on('close', () => {
            console.log(`Client ${clientId} Connection Closed`)
            clients = clients.filter(client => client.id !== clientId);
        });
    }
    
}

async function sendNewMemberEventsToAll(group_id) {
    console.log("sending!")
    console.log("clients are " + clients) /////////////////////
    const group_users = await schemas.Users.find({groupID: group_id});
    clients.forEach((client) => {
        const c_id = client.id; //need make to string so can use slice? `${client.id}` can!!, but no need!!!
        console.log(`ITS ${c_id}`)
        const _index = c_id.search("_");
        const GroupID = client.id.slice(_index+1, );
        if (GroupID == group_id) {
            client.res.write('event: message\n'); // need this to trigger "onmessage"!! TO NOTE!!!
            //client.res.write(`GroupMembersInfo: ${JSON.stringify(group_users)}`); // CANNOT SIA.... // TO NOTE!! NEED "data" specifcally for key!!
            client.res.write(`data: ${JSON.stringify(group_users)}`);
            client.res.write("\n\n");
        }
    });
}
    


/*
// curl -H Accept:text/event-stream http://localhost:4000/GroupLobby/RT:12

curl -X POST \
 -H "Content-Type: application/json" \
 -d '{"ggid": "10"}'\
 -s http://localhost:4000/GroupLobby/trySSE
*/
/*
exports.tryOutSSE = async(req,res) => {
    const gid = req.body.ggid;
    //const group_users = await schemas.Users.find({groupID: group_id});
    await sendNewMemberEventsToAll(gid);
    res.end();
}
*/
    


// get user
exports.getUserFromID = async(req, res) => {
    const userID = req.body.userID;
    const groupID = req.body.groupID;
    const user = await schemas.Users.findOne({"groupID": groupID, "userID": userID});
    res.send(user);
}

exports.EditUserInfo = async(req, res) => {
    const user = await schemas.Users.findOne({"groupID": req.body.GroupID, "userID": req.body.UserID});

    const UserTimingInfo = [...req.body.UserDT];
    // remove duplicate dates... add next time...
    sortISOdt(UserTimingInfo)

    user.meetDateTime = UserTimingInfo;
    user.name = req.body.UserData.Name;
    user.location.LatLon.Lat = req.body.UserData.LatLon.Lat;
    user.location.LatLon.Lon = req.body.UserData.LatLon.Lon;
    user.location.AddressName = req.body.UserData.AddressName;
    await user.save(); // so below will have this updated info!!
    //const groupDateTimeInfo = newMeetdt(req.body.meetDateTime)
    //sortISOdt(groupDateTimeInfo)
    //res.send(user);
    //// TO BE SAFE, PUT RES.SEND() AFTER THE UPDATE TO PREVENT POSSIBLE RACE CONDITIONS!!
    //res.end();
    await GroupController.updateGroupDetails(req.body.GroupID)
    // TO PREVENT POSSIBLE RACE CONDITIONS!!!
    res.end();
    sendNewMemberEventsToAll(req.body.GroupID)
    //console.log("bebe")
    GroupController.sendMemberInfoChangeEventsToAllHome(req.body.GroupID);
}







/*
exports.getUserFromName = async(req, res) => {
    const userName = req.params.userName
    const groupID = req.params.groupID
    const group = await schemas.Groups.findOne({_id: groupID})
    const user = await schemas.Users.findOne({name: userName, groupID: groupID})
    res.send(user);
}
*/

// router.post('/userLoggedIn', async(req, res) => {
//     console.log('updating user logged in status')
//     const user = await schemas.Users.findOne({_id: req.body._id});
//     const updatedUser = await user.updateOne({
//         loggedIn: req.body.loggedIn
//     })
//     console.log(JSON.stringify(user))
//     user = await schemas.Users.findOne({_id: req.body._id});
//     console.log(JSON.stringify(user))
//     res.send(user)
//     res.end()
// })
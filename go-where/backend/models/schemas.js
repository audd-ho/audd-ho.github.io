const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    place_id: {type: String, required: true},
    name: {type: String, required: true},
    formatted_address: {type: String, required: true},
    photo_reference: {type: String, required: false},
    place_type: {type: String, required: true},
})

const groupSchema = new Schema({
    groupID: {type:Number, required:true, unique:true, dropDups:true},
    groupName: {type:String, required:true},
    groupCode: {type:String, required:true},
    meetDateTime: {type:[Date], required:true},
    groupUsers: {type:[Number], required:true},
    datesVote: {type:[Number], required:true},
    chosenMDT: {type:Date, required:false},
    centralLocation: {
        LatLon: {
            Lat:{type:Number, required:false},
            Lon:{type:Number, required:false}
        }
    },
    activityList: {type: [activitySchema], required:false}
    //datesVotedUsers: {type:[Number], required:true} // number of people who voted for a date already, but saved using userId so know who havent voted!
});

const userSchema = new Schema({
    userID: {type:Number, required:true},
    groupID: {type:Number, required:true},
    name: {type:String, required:true},
    leader: {type:Boolean, required:true, default:false},
    meetDateTime: {type:[Date], required:true},
    location: {
        LatLon: {
            Lat:{type:Number, required:true},
            Lon:{type:Number, required:true}
        },
        AddressName: {type:String, required:true}
    }
});

const Groups = mongoose.model('Groups', groupSchema, 'groups');
const Users = mongoose.model('Users', userSchema, 'users');

const mySchemas = {'Groups':Groups, 'Users':Users};

module.exports = mySchemas;
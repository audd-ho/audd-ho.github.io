const schemas = require('../models/schemas')
const mongoose = require('mongoose')
const express = require('express')
const { Client } = require("@googlemaps/google-maps-services-js");

const API_KEY = process.env.GOOGLE_MAPS_API_KEY


const putActivitiesInDB = async (group, radius) => {
    // const group = await schemas.Groups.findOne({_id: req.params.groupID})
    const centralCoordinatesArr = JSON.stringify(group.centralLocation).replaceAll(' ', '').replaceAll('[', '').replaceAll(']', '').split(',');
    const centralCoordinates = centralCoordinatesArr[1] + ',' + centralCoordinatesArr[0];
    console.log('controllers/activity.js central coordinates: ' + centralCoordinates)

    // intermediate result
    let placesList = [];

    // only return these place types (google-maps-services-js does not allow multiple types per call)
    const activityTypes = [
        'aquarium',
        'amusement_park',
        'art_gallery',
        'bowling_alley',
        'casino',
        'library',
        'movie_rental',
        'movie_theater',
        'museum',
        'night_club',
        'shopping_mall',
        'spa',
        'tourist_attraction',
        'zoo',
    ]

    // get places
    for (let i = 0; i < activityTypes.length; i++) {
        console.log('controllers/activity.js:');
        console.log('activityType: ' + activityTypes[i]);
        console.log('api key: ' + API_KEY);
        console.log('radius: ' + radius);
        console.log('centralCoordinates: ' + centralCoordinates);
        console.log('=====')
        const client = new Client({});
        await client.placesNearby({
            params: {
                location: centralCoordinates,
                key: API_KEY,
                radius: radius,
                type: activityTypes[i],
            },
            timeout: 5000, // milliseconds
        }).then(async (r) => {

            // filter out places
            let filteredPlaces = [];
            for (let j = 0; j < r.data.results.length; j++) {
                let place = r.data.results[j];
                console.log(activityTypes[i])
                if ((place.permanently_closed == undefined || place.business_status == 'OPERATIONAL' )) {
                    filteredPlaces.push({
                        place: place,
                        type: activityTypes[i]
                    });
                }
            }

            // add all places to placeList
            for (let j = 0; j < filteredPlaces.length; j++) {
                if (!placesList.find(e => e.place == filteredPlaces[j].place)) {
                    placesList.push({
                        place: filteredPlaces[j].place,
                        type: filteredPlaces[j].type
                    })
                }
            }
        }).catch((e) => {
            console.log('controllers/activity.js placesNearby error ' + e.message);
        });
    }

    return await Promise.all(placesList.map(async (placeItem) => {
        return await getActivityDoc(placeItem.place, placeItem.type);
    }));
}

const getActivityDoc = async (place, type) => {
    const existingPlace = await schemas.Activities.findOne({place_id: place.place_id})
    if (!existingPlace) {
        const formattedAddress = await reverseGeocode(place.place_id, place.geometry.location)
        /*
            take out only the data we need & put inside activityList
            place_id
            name
            formatted_address
            photos --> PlacePhoto[0] (only the first picture needed)
                each PlacePhoto element has:
                    height
                    html_attributions
                    photo_reference of first photo
                    width
        */
        const newActivity = new schemas.Activities({
            place_id: place.place_id,
            name: place.name,
            photo_reference: place.photos && place.photos[0] ? place.photos[0].photo_reference : "",
            formatted_address: formattedAddress,
            place_type: type.replace('_', ' '),
        })
        const saveActivity = await newActivity.save()
        if (!saveActivity) {
            console.log('activity.js line 91: error saving activity')
        }
        return newActivity
    } else {
        return existingPlace
    }
}

/* convert latlng from place.geometry.location into formatted address */
const reverseGeocode = async (place_id, location) => {
    const client = new Client({})
    return await client.reverseGeocode({
        params: {
            key: API_KEY,
            location: location,
            place_id: place_id
        },
        timeout: 1000, // milliseconds
    }).then((r) => {
        return r.data.results[0].formatted_address
    }).catch((e) => {
        console.log(e.message);
    });
}

const calculateCentralLocation = async (group) => {
    let lng = 0, lat = 0
    let length = group.members.length
    for (let i = 0; i < length; i++) {
        let user = await schemas.Users.findOne({_id: group.members[i]})
        lng += user.location.coordinates[0] // coordinates in schema are [lng, lat]
        lat += user.location.coordinates[1]
    }
    lng = lng / length
    lat = lat / length
    console.log('controllers/activity.js calculateCentralLocation: lng: ' + lng + '; lat: ' + lat);
    return [lng, lat]
}

// get the final chosenDateTime & calculate central location & get activities --> send group back
exports.start = async(req, res) => {
    const group = await schemas.Groups.findOne({_id: req.body.groupID})

    // check that all users have voted
    let sum = 0
    group.votes.forEach(vote => sum += vote)
    if (sum != group.members.length) {
        console.log('controllers/activity.js not all group members have voted')
        res.status(400).send('Not all group members have voted!')
    } else {
        // get chosenDateTimeIndex
        const votes = group.votes
        const chosenDateTimeIndex = votes.indexOf(Math.max(...votes))
        await group.updateOne({chosenDateTimeIndex: chosenDateTimeIndex}) // save the finalised date
        console.log('controllers/activity.js start: chosenDateTimeIndex: ' + chosenDateTimeIndex)

        // calculate the central location
        await group.updateOne({centralLocation: await calculateCentralLocation(group)})
        console.log('controllers/activity.js start: centralLocation: ' + group.centralLocation)
        if (!group.centralLocation) console.log('oopsies')


        // get activity list
        let radius = 2000 // default radius
        let activityList = await putActivitiesInDB(group, radius)
        while (activityList.length < 10) {
            radius+= 1000
            activityList = await putActivitiesInDB(group, radius)
        }
        await group.updateOne({activityList: activityList});
        console.log('controllers/activity.js start: activityList: ' + group.activityList)
        
        const startedGroup = await schemas.Groups.findOne({_id: req.body.groupID})
        console.log(startedGroup)
        res.send(startedGroup)
    }
}

exports.getPhoto = async(req, res) => {
    const photoRef = req.params.photoRef
    // console.log('controllers/activity.js getPhoto: photoRef: ' + photoRef.substring(1, photoRef.length - 1))
    const client = new Client({})
    return await client.placePhoto({
        params: {
            key: API_KEY,
            photoreference: photoRef.substring(1, photoRef.length - 1),
            maxwidth: 300,
            maxheight: 200,
        },
        timeout: 2000, // milliseconds
    }).then((r) => {
        // console.log(r.data)
        res.send(r.data)
    }).catch((e) => {
        console.log('controllers/activity getPhoto error ' + e.message);
    });
}

// get formatted_phone_number, opening_hours, url, and rating from google api
exports.getDetails = async(req, res) => {
    const place_id = req.params.place_id
    const client = new Client({})
    return await client.placeDetails({
        params: {
            key: API_KEY,
            place_id: place_id.substring(1, place_id.length - 1)
        },
        timeout: 2000,
    }).then((r) => {
        // console.log(r.data.result)
        res.send(JSON.stringify({
            'formatted_phone_number' : r.data.result.formatted_phone_number ? r.data.result.formatted_phone_number : 'No phone number available',
            'opening_hours' : r.data.result.opening_hours,
            'url' : r.data.result.url,
            'rating' : r.data.result.rating,
            'website' : r.data.result.website
        }))
    }).catch (err => {
        console.log('controllers/activity.js getDetails error: ' + err)
    })
}
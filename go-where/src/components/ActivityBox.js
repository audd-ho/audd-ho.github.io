import React, {useEffect, useState} from 'react';
import ky from 'ky';
import { ActivityPopup } from './ActivityPopup.js';
import './TextField.css';
//import './Images.css';
import star_unvoted from '../images/star_unvoted.png'
// import {Link} from 'react-router-dom';

export const ActivityBox = ({activity})=> {
    // for popup
    const [open, setOpen] = useState(false);

    // get photo from backend (backend gets photo from google api)
    const [imgurl, setImgurl] = useState("");

    const getPhoto = async (activity) => {
        if (activity.photo_reference !== '' && activity.photo_reference !== undefined) {
            const response = await fetch('http://localhost:4000/activity/getPhoto/' + new URLSearchParams({
                photoRef: JSON.stringify(activity.photo_reference),
            }))
            .then(async response => {
                setImgurl(response.url);
            }).catch(err => {
                console.log(err)
            })
        }
    }
    useEffect(() => {
        getPhoto(activity)
    })

    return(
        <div className="container-activity" onClick={() => setOpen(o => !o)}>
            {/* <img id='star-unvoted' src={star_unvoted} alt='not voted'/> */}
            <h2 id='activity-box' className="text-overflow">{activity.name}</h2>
            <p id='activity-box' className='text-overflow'>{activity.place_type}</p>
            <img id='activity-box' src={imgurl}></img>
            <p id="activity-box" className="text-overflow">{activity.formatted_address}</p>
            <ActivityPopup activity={activity} open={open} setOpen={setOpen} imgurl={imgurl}/>
        </div>
    );
}
import { Link } from "react-router-dom";
import { ProvideUserInfo } from "../ProvideUserInfo";
import React, { useState,useEffect } from 'react';
import FindActivites from "../FindActivities";


export const Testy = () => {

    const [curUserData, setcurUserData] = useState({
        "Name" : "User1",
        "AddressName" : "Address1",
        "LatLon" : "",
        "SpecificAddressInfo" : ""
    }) // info one may need details but here no need

    //curUserData.AddressName = "Singa"

    const dataChange = newData => {
        setcurUserData(newData)
        //console.log(newData)
        //console.log(curUserData)
    }
    useEffect (() => {console.log(curUserData)}, [curUserData])

    const GroupCode = window.location.pathname.slice(-5) // to get team code to ask db for data?
    console.log(GroupCode)
    //alert(the_url)
    function alertty() {
        alert("HIIIII");
    }
    useEffect(() => {
        console.log("HI");
    }, [])

    async function tryoutdetails(){
        fetch("/GroupPage");
    }

    return(
        <>
            <h1>test page 123</h1>
            <Link to="#"><button className="btn btn-warning">TO SELF!!</button></Link>
            <div>< ProvideUserInfo curUserData={curUserData} dataChange={dataChange} /></div>
            <button className="btn btn-warning" onClick={tryoutdetails}>TRY details!!</button>
            <div>< FindActivites /></div>
        </>
    );
}
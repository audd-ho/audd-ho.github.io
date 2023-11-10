import React, { useState, useEffect } from 'react';
import  '../../App';
import '../TextField.css';
import './CreateGroup.css';
import '../FooterButtons.css';
import { ChooseDateTimeBox } from '../ChooseDateTimeBox';
import { Link, useNavigate } from 'react-router-dom';
//import ky from 'ky';
import { DateObject } from "react-multi-date-picker";
import { ProvideUserInfo } from '../ProvideUserInfo';


function CreateGroup(){

    let navigate = useNavigate();

    const [curUserData, setcurUserData] = useState({
        "Name" : "",
        "AddressName" : "",
        "LatLon" : { ["Lat"]: "" , ["Lon"]: ""},
        "SpecificAddressInfo" : ""
    }) // info one may need details but here no need

    //curUserData.AddressName = "Singa"

    const dataChange = newData => {
        setcurUserData(newData)
        //console.log(newData)
        //console.log(curUserData)
    }
    useEffect (() => {console.log(curUserData)}, [curUserData])

    const [groupName, setGroupName] = useState("");
    const [meetDateTime, setMeetDateTime] = useState(
        [].map((number) =>
            new DateObject().set({
                day: number,
                hour: number,
                minute: number,
                // second: number,
            })
        )
    )


    const sendGroupDetails = async() => {
        const UserDataToSend = {
            "Name" : curUserData.Name,
            "AddressName" : curUserData.AddressName,
            "LatLon" : curUserData.LatLon,
        }
        const groupCreationData = {
            "groupName": groupName,
            "meetDateTime": meetDateTime,
            "userData" : UserDataToSend
        }
        const response = await fetch('http://localhost:4000/CreateGroup', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(groupCreationData)
        }).then((response) => response.json())
        //await response
        //var aa = response.json()
        console.log(response)
        //console.log(aa)
        ///console.log(response["data is"])
        ///console.log(response["Group Code"])
        //navigate("/GroupPage/" + response["Group Code"])
        localStorage.setItem("UserID", response.groupUsers[0])
        localStorage.setItem("GroupID", response.groupID)
        navigate("/GroupPage/" + "Home")
        //console.log(result)
    }

    

    return(
        <div>
            <div className="centerCreate" style={{}}>
                <h2>Group Name</h2>
                <input name="groupName" className="input" type="text"
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter Group Name"/>
                <div className='centerExtra'>
                    <div>       
                    < ProvideUserInfo curUserData={curUserData} dataChange={dataChange} />
                    </div>
                    <div>
                    <ChooseDateTimeBox className
                        updateTimeBox={dateObj => setMeetDateTime(dateObj)}
                        timeBox={meetDateTime}
                    ></ChooseDateTimeBox>
                    </div>
                </div>
            </div>

            <div className="footer">
                <div className="backDiv">
                    <Link to='/'>
                        <button className="btn btn-warning">Back</button>
                    </Link>
                </div>
                <div className="nextDiv">
                    {/* <Link to='/GroupPage'> */}
                        <button id="grabGroupDetails" className="btn btn-warning" onClick={sendGroupDetails}>Next</button>
                    {/* </Link> */}
                </div>
            </div>
        </div>
        
        
    );
}
export default CreateGroup;
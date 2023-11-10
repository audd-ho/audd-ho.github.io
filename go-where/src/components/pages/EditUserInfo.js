import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import  '../../App';
import '../TextField.css';
import './EditUserInfo.css';
import '../FooterButtons.css';
import { ChooseDateTimeBox } from '../ChooseDateTimeBox'; //
import { Link, useNavigate } from 'react-router-dom';
//import ky from 'ky';
import { DateObject } from "react-multi-date-picker"; //
import { ProvideUserInfo } from '../ProvideUserInfo';

// MAYBE ADD PROP SO EDIT AND ALL IS EASIER? COS EDIT THEN PASS VALUE OF USER AND ADDRESS, ELSE DONT NEED FOR ADD FIRST TIME!

function EditUserInfo(){

    const [userName, setuserName] = useOutletContext();

    let navigate = useNavigate();

    /*
    const [InitialUserData, setInitialUserData] = useState({
        "Name" : "",
        "AddressName" : "",
        "LatLon" : { ["Lat"]: "" , ["Lon"]: ""},
        "SpecificAddressInfo" : ""
    })
    */

    // THESE VALUES NEED SET AND GET FROM DATABASE
    const [curUserData, setcurUserData] = useState({
        "Name" : "",
        "AddressName" : "",
        "LatLon" : { ["Lat"]: "" , ["Lon"]: ""},
        "SpecificAddressInfo" : ""
    }) // info one may need details but here no need

    //curUserData.AddressName = "Singa"

    const dataChange = newData => {
        setcurUserData(newData)
    }

    useEffect (() => {console.log(curUserData)}, [curUserData])

    
    //const [InitialSelectedTimes, setInitialSelectedTimes] = useState([]);


    const [SelectTimes, setSelectTimes] = useState();
    const [SelectedTimes, setSelectedTimes] = useState([]);
    console.log(SelectedTimes)
    //console.log("HEY PIGGY")


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
    function newMeetdt(meetDT) {
        const formattedDT = []
        meetDT.forEach(DT => {
            let d = new Date(DT);
            d.setSeconds(0,0);
            formattedDT.push(d.toISOString());
        })
        return formattedDT;
    }
     // can also get from outlet context with layout outlet but isok
    const groupId = localStorage.getItem("GroupID"); // can also get from outlet context with layout outlet but isok
    const userId = localStorage.getItem("UserID"); // can also get from outlet context with layout outlet but isok
     // can also get from outlet context with layout outlet but isok
    
    console.log(groupId)

    function removeItemOnce(arr, value) {
        let index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
    }
    
    function checkoOnce(){ // not the best check but yeaaa...
        if (groupId==null){navigate('/'); return true;}
        return false;
    }

    /*
    useEffect(()=>{
        if (checkoOnce()) {return;}
    },[])
    */

    const [DataInitialised, setDataInitialised] = useState(false)
    //const [InitialProvideUserInfo, setInitialProvideUserInfo] = useState()

    useEffect(() =>{
        if (checkoOnce()) {return;}

        async function setUserDeets(){
            const UserDeets = await fetch("/GroupLayout/GetUser", {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"userID" : userId, "groupID" : groupId})
                }).then((response) => response.json())
            //const UserDeets = await getUserInfo();
            //const UserDeets = await result.json();
            console.log(UserDeets);

            setSelectedTimes(UserDeets.meetDateTime)

            setcurUserData({
                "Name" : UserDeets.name,
                "AddressName" : UserDeets.location.AddressName,
                "LatLon" : { ["Lat"]: UserDeets.location.LatLon.Lat , ["Lon"]: UserDeets.location.LatLon.Lon},
                "SpecificAddressInfo" : "" // no need one...
            })

            setDataInitialised(true);

            /*

            //setInitialSelectedTimes(UserDeets.meetDateTime)

            setInitialUserData({
                "Name" : UserDeets.name,
                "AddressName" : UserDeets.location.AddressName,
                "LatLon" : { ["Lat"]: UserDeets.location.LatLon.Lat , ["Lon"]: UserDeets.location.LatLon.Lon},
                "SpecificAddressInfo" : "" // no need one...
            })

            */

            //console.log(InitialSelectedTimes)
            //console.log(InitialUserData)
        }
        setUserDeets();
    }, [])
    /*
    const ChooseTime = useCallback((event) =>{
        //console.log(SelectedTimes)

        //console.log(event.target.className)
        //console.log(event.target.classList)
        //return;
        if (event.target.classList.contains("active")) {event.target.classList.remove("active")}
        else {event.target.classList.add("active")}
        //console.log(event.target.className)
        console.log(event.target.value)
        const ChosenTime = event.target.value;
        console.log(SelectedTimes)
        
        if (SelectedTimes.includes(ChosenTime)) {setSelectedTimes(removeItemOnce(SelectedTimes, ChosenTime));}
        else {const tt = SelectedTimes; tt.push(ChosenTime); setSelectedTimes(tt)}
        console.log(SelectedTimes);
        
    },[DataInitialised])
    */    

    useEffect(()=>{
        //if (!DataInitialised) {return;}
        async function getGroupTimes(){
            const response_G = await fetch("/GroupLayout/GetGroup", {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"groupID" : groupId})
            }).then((response) => response.json())
            const timingDetailsList = response_G.meetDateTime
            /*
            const temp_select = []
            timingDetailsList.forEach(timing => {
                const timingDate = formatDate(timing)
                const timingTime = formatTime(timing)
                temp_select.push(<>
                <p className='datetexts' style={{}}><u>{timingDate}</u></p>
                <button type="button" className="btn btn-success rounded-pill timingsButton" onClick={() => renderConfirmButton(member.userID, member.name)}>{timingTime}</button>    
                </>
                )
            })
            */
            const dates_choices_set = new Set()
            const sorted_unique_dates_choices = []
            timingDetailsList.forEach(timing => {
                const timingDate = formatDate(timing)
                //const timingTime = formatTime(timing)
                dates_choices_set.add(timingDate)
            })
            for (let element of dates_choices_set){sorted_unique_dates_choices.push(element);}
            sortDate(sorted_unique_dates_choices)
            //console.log(sorted_unique_dates_choices)
            const dates_dict = {}
            for (let dateee of sorted_unique_dates_choices) {dates_dict[dateee] = [];}
            //console.log(dates_dict)
            //const trying = []
            timingDetailsList.forEach(timing => {
                const timingDate = formatDate(timing)
                const timingTime = formatTime(timing)
                dates_dict[timingDate].push(timingTime)
                //trying.push(timingTime)
            })
            //console.log(dates_dict)




            const response_U = await fetch("/GroupLayout/GetUser", {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"userID" : userId, "groupID" : groupId})
            }).then((response) => response.json())
            //console.log(response_U)

            function ChooseTime(event){
                if (event.target.classList.contains("active")) {event.target.classList.remove("active")}
                else {event.target.classList.add("active")}
                //console.log(event.target.className)
                console.log(event.target.value)
                const ChosenTime = event.target.value;
                console.log(SelectedTimes)
                
                if (SelectedTimes.includes(ChosenTime)) {setSelectedTimes(removeItemOnce(SelectedTimes, ChosenTime));}
                else {const tt = SelectedTimes; tt.push(ChosenTime); setSelectedTimes(tt)}
                console.log(SelectedTimes);
            }

            const usertimingDetailsList = response_U.meetDateTime
            const Temp_select = []
            sorted_unique_dates_choices.forEach(day =>{
                const Temp_select_day = []
                const timings_in_day = dates_dict[day];
                sortTime(timings_in_day);
                Temp_select_day.push(
                    <p className='datetexts' key={day} style={{}}><u>{day}</u></p>
                )
                for (let times of timings_in_day) {
                    const dt = (day + " " + times)
                    ///console.log(dt)
                    const ISOdt = new Date(dt).toISOString()
                    ///console.log(usertimingDetailsList)
                    ///console.log(ISOdt)
                    Temp_select_day.push(
                        <button type="button" key={ISOdt} className={"btn btn-primary rounded-pill timingsButton" + ((usertimingDetailsList.includes(ISOdt))? "":" active")} value={ISOdt} onClick={(e) => {ChooseTime(e)}}>{times}</button>    
                    )
                    /*
                    if (usertimingDetailsList.includes(ISOdt))
                    {
                        temp_select_day.push(
                            <button type="button" className="btn btn-primary rounded-pill timingsButton" value={ISOdt} onClick={(e) => {ChooseTime(e)}}>{times}</button>    
                        )
                    }
                    else
                    {
                        temp_select_day.push(
                            <button type="button" className="btn btn-primary rounded-pill timingsButton active" value={ISOdt} onClick={(e) => {ChooseTime(e)}}>{times}</button>    
                        )
                        //console.log(Date.parse(dt))
                    }
                    */

                }
                Temp_select.push(
                    <>
                    {Temp_select_day}
                    </>
                )
            })
            //sortTime(trying)
            //console.log(trying);

            setSelectTimes(Temp_select);
            //console.log(response_G.meetDateTime)
            ////console.log(SelectTimes)
            /*
            console.log(response_G.meetDateTime)
            for (let j = 0; j < response_G.meetDateTime.length; j++){
                console.log(formatDate(response_G.meetDateTime[j]))
                console.log(formatTime(response_G.meetDateTime[j]))
            }
            */
        }
        getGroupTimes();
        //setInitialProvideUserInfo(< ProvideUserInfo curUserData={curUserData} dataChange={dataChange} />)
    },[DataInitialised])


    /*
    useEffect(() =>{
        console.log(InitialProvideUserInfo)
    }, [InitialProvideUserInfo])
    */

    /*
    useEffect(()=>{
        async function setUserDeets(){
            const result = await fetch("/GroupLayout/GetUser", {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"userID" : userId, "groupID" : groupId})
                })//.then((response) => response.json())
            //const UserDeets = await getUserInfo();
            const UserDeets = await result.json();
            console.log(UserDeets);


            setSelectedTimes(UserDeets.meetDateTime)
            console.log(SelectedTimes)
            setcurUserData({
                "Name" : UserDeets.name,
                "AddressName" : UserDeets.location.AddressName,
                "LatLon" : { ["Lat"]: UserDeets.location.LatLon.Lat , ["Lon"]: UserDeets.location.LatLon.Lon},
                "SpecificAddressInfo" : "" // no need one...
            })
            console.log(curUserData)
        }
        




        

        function getUserInfo(){
            return new Promise((resolve, reject) =>{
                resolve(
                    fetch("/GroupLayout/GetUser", {
                    method: "POST",
                    mode: "cors",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({"userID" : userId, "groupID" : groupId})
                    }).then((response) => response.json())
                );
                reject(console.log("HELPS"));
            })
        }
        





        setUserDeets();
    },[])
    */

    /*
    useEffect(() =>{
        if (membersDetails == null) {return;}
        const temp_select = []
        membersDetails.forEach(member => {
            temp_select.push(
                <button type="button" className="btn btn-success rounded-pill membersButton" key={member.userID} onClick={() => renderConfirmButton(member.userID, member.name)}>{member.name}</button>    

            )
        });
        setmembersSelect(temp_select);
    },[membersDetails])
    */

    const sendUserDetails = async() => {
        const UserDataToSend = {
            "Name" : curUserData.Name,
            "AddressName" : curUserData.AddressName,
            "LatLon" : curUserData.LatLon,
        }
        console.log(SelectedTimes)
        const userData = {
            "UserData" : UserDataToSend,
            "UserDT" : SelectedTimes,
            "GroupID": groupId,
            "UserID": userId
        }
        console.log(userData)
        const response = await fetch('http://localhost:4000/EditUserInfo', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userData)
        })////.then((response) => response.json())
        //await response
        //var aa = response.json()
        ////console.log(response)
        //console.log(aa)
        //alert(response["data is"])
        //alert(response["Group Code"])
        //localStorage.setItem("UserID", response.userID)
        setuserName(curUserData.Name)
        navigate("/GroupPage/Home")
        //console.log(result)
    }
    

    return(
        <div className=''>
            <div className='AddcenterI'>
                <div style={{marginRight:"15px"}}>
                <h3 className='border-bottom border-dark' style={{color:"#665544", paddingBottom:"9px"}}>User Info</h3>
                {/* < ProvideUserInfo curUserData={curUserData} dataChange={dataChange} /> */}
                {/* (DataInitialised)? InitialProvideUserInfo:null*/}
                {(DataInitialised)? < ProvideUserInfo curUserData={curUserData} dataChange={dataChange} />: null}
                </div>
                <div className='justify-content-center flex-wrap border-start border-dark timingFormat'>
                    <div className='border-bottom border-dark'>
                        <h3 style={{color:"#664433"}}> Vote for Dates & Timings: </h3>
                    </div>
                    <div className='scrolling' style={{textAlign:"left"}}>
                    {(SelectTimes==null)? null: SelectTimes}
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
                        <button className="btn btn-warning" onClick={sendUserDetails}>Confirm!</button>
                    {/* </Link> */}
                </div>
            </div>
        </div>
        
        
    );
}
export default EditUserInfo;
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from "react-router-dom";
//import FindActivites from '../FindActivities';
import "./GroupHome.css";
import { Tooltip } from '@mui/material';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import FindActivites from '../FindActivities';
//import Modal from '../Modal';

function GroupHome(){

    const Navigate = useNavigate();

    function formatDate(string){
        var options = { year: 'numeric', month: 'long', day: 'numeric', day: "2-digit"};
        return new Date(string).toLocaleDateString("en-SG",options);
    }

    function formatTime(string){
        var options = { hour: "2-digit", minute: "2-digit"};
        return new Date(string).toLocaleTimeString("SG", options)
    }

    //const []
    const groupId = localStorage.getItem("GroupID");
    const userId = localStorage.getItem("UserID");

    const [IsLeader, setIsLeader] = useState(false)

    const [receivedMDT, setreceivedMDT] = useState([])
    const [membersDetails, setmembersDetails] = useState([]) // for right side of screen
    //const []

    const [shownMDT, setshownMDT] = useState()
    const [shownMemDeets, setshownMemDeets] = useState()

    const [Selected, setSelected] = useState([])
    
    const onSelect = useCallback((card_num_item) => {
        console.log(IsLeader) // to debug the stale useState!! :))
        //return;
        ////if (!IsLeader) {setopen(true); return;}
        //console.log("LEADER SEE")
        /*
        let ini_cards = []
        for (let f = 0; f < Selected.length; f++) {ini_cards.push(false);}
        ini_cards[card_num_index] = true;
        setSelected(ini_cards);
        */
        const cards_selector = document.querySelectorAll(".card-select")
        cards_selector.forEach(card => {
            if (card.classList.contains("selected")) {card.classList.remove("selected")}
        })
        
        //console.log(card_num_item)
        //console.log(Selected)
        card_num_item.classList.add("selected")
        let temp = Selected // cos usestate changing thats why re-render...
        //console.log(card_num_item.value) // WHY .VALUE IS UNDEFINED??????????
        //console.log(temp)
        temp = temp.map(card_selected => card_selected = false)
        //console.log(temp)
        temp[card_num_item.id] = true
        //console.log(temp)
        setSelected(temp) // works but not due to this...// check and do smth!!
        if (!IsLeader) {setopen(true); return;}
    }, [IsLeader]) // to redefine the function whenever IsLeader changes, to prevent stale function cos button point to wrong function or if point to correct function, then the function point/reference to wrong IsLeader, so this solves the reference to IsLeader, cos when IsLeader is re-defined, then this function also is re-defined to point at new IsLeader useState hook(?) or state variable yeaaa...!!!

    // to test the useCallBack function whether it re-defines function, it does!!!
    /*
    const temp_try = []
    temp_try.push(
        <button onClick={onSelect}> try</button>
    )
    */

    /*
    const listenSelect = useCallback((card_num_item) => {
        onSelect(card_num_item)
    },[])
    */
    const [open, setopen] = useState(false)
    const StartButton = useRef()
    useEffect(() =>{
        if (!IsLeader) {return;}
        console.log(Selected)
        Selected.forEach(isSelected => {
            if (isSelected) {if (StartButton.current.classList.contains("disabled")) {StartButton.current.classList.remove("disabled")}}
        })
    }, [Selected])

    /*
    useEffect(() => {
        //alert(IsLeader)
    },[IsLeader])
    */

    useEffect(() =>{
        console.log("GROUP DEETS CHANGE!!")
        //const options = { year: 'numeric', month: 'long', day: 'numeric', day: "2-digit"};
        let card_num = 0;

        const card_info = []
        receivedMDT.forEach(mdt => {
            const namesForMDT = []
            membersDetails.forEach(groupMember => {
                if (groupMember.meetDateTime.includes(mdt)) {
                    namesForMDT.push(<h6 key={`${groupMember.userID}_${mdt}`} className='blockquote' style={{fontSize:"16px", marginBottom:"0px", lineHeight:"25px"}}>{groupMember.name}</h6>)
                }
            })
            card_info.push(
                <div key={mdt} id={card_num} value={mdt} onClick={(e) => onSelect(e.currentTarget)} className={"card card-select"} style={{minWidth: "300px", width: "18rem", marginRight:"25px"}}>
                    <img src={require("../Solid_black.png")} className="card-img-top weather-effect-image" alt="" />
                    <div className="card-body" style={{paddingBottom:"3px", paddingTop:"15px", maxHeight:"77.2px", minHeight:"77.2px"}}>
                        <h5 className="card-title">{formatDate(mdt)}</h5>
                        <h6 className="card-title">{formatTime(mdt)}</h6>
                        {/* <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p> */}
                    </div>
                    <ul className="list-group list-group-flush activity-group-members-name-div">
                        <li className="list-group-item">
                            {namesForMDT}
                            {/*
                            <p>{"NAMESSS!!!!!!!!!!"}</p>
                            <p>{"NAMESSS!!!!!!!!!!"}</p>
                            <p>{"NAMESSS!!!!!!!!!!"}</p>
                            */}
                        </li>
                        {/*
                        <li className="list-group-item">A second item</li>
                        <li className="list-group-item">A third item</li>
                        */}
                    </ul>
                    {/*
                    <div className="card-body">
                        <a href="#" className="card-link">Card link</a>
                        <a href="#" className="card-link">Another link</a>
                    </div>
                    */}
                </div>
            )
            card_num++;
        })
        const total_card_info = []
        total_card_info.push(
            <>
            {/* <h3 className="font-weight-light">{"THE GROUP NAME"}</h3> */}
            <h4 className="font-weight-light" style={{marginTop:"25px", marginBottom:"20px", marginLeft:"12px"}}>{"Possible Dates!"}</h4>
            <div className="container-fluid py-2 activity-group-scroll-box" style={{overflow: "auto"}}>
                <div className="d-flex flex-row flex-nowrap">
                    {card_info}
                </div>
            </div>
            </>
        )
        setshownMDT(total_card_info)
        console.log(shownMDT)
    },[receivedMDT, membersDetails, onSelect]) // onSelect dependency so if isLeader is changed, then the function redefined, so then the button change the onClick to this new re-defined onSelect function!!!!
    useEffect(() =>{
        const temp_memdeets = []
        membersDetails.forEach(memdeets => {
            temp_memdeets.push(
            <h6 key={memdeets.userID} className='lead' style={{fontSize:"23px", marginBottom:"5px", lineHeight:"20px"}}>{memdeets.name}</h6>
            )
            if (memdeets.userID == userId) {setIsLeader(memdeets.leader); console.log(memdeets.leader)}
            //return;
        })
        const temp_memdeets_div = []
        temp_memdeets_div.push(
            <>
            <h4 className='border-bottom border-dark group-members-name-div' style={{marginTop:"50px", marginBottom:"5px"}}>Group Members: </h4>
            <div className='group-members-name-div' style={{height:"500px" , "overflowY":"scroll"}}>
                {temp_memdeets}
            </div>
            </>
        )
        setshownMemDeets(temp_memdeets_div)
    },[membersDetails])

    useEffect(() =>{
        //console.log("1")
        //if (ONCE) {
            const events = new EventSource(`http://localhost:4000/GroupHome/RT:${groupId}`); // to be fixed! // is confirm just only need send groupID, but where to send to and set up, all not done yet!!
            console.log("CONNECTION SECURED!")
            events.onmessage = (event) => {
                console.log("RECEIVING")
                console.log(event)
                console.log(event.data) // idt need group details here?, group name also done by layout anyway, if want just for name can just send one fetch ONCE only ah... if want set up...
                const received_data = JSON.parse(event.data)
                console.log(received_data)
                const MostVotedMDT = received_data.MostVotedMDT;
                const groupUsersData = received_data.groupUsersData;

                console.log(MostVotedMDT)
                console.log(groupUsersData)

                const temp_c = []
                const num_c = MostVotedMDT.length
                for (let m = 0; m < num_c; m++) {
                    temp_c.push(false)
                }
                setSelected(temp_c);

                //console.log(event.data.pie)
                //console.log(event.data.usersDeets) 
                //console.log(event.data.MostVotedMDT) // with leader inside!!, this is in ISOString()!!, loop and stuff to put as cards, then everything onmessage then update also, the put s card define etc at another useffect, dependent on user details or smth!!
                //console.log(event.data.leaderMDT)
                //const groupUsersInfo = JSON.parse(event.data);
                setreceivedMDT(MostVotedMDT)
                setmembersDetails(groupUsersData); // trigger the other effect depended on membersDetails
            }
            return (() => {events.close(); console.log("CLOSED CONNECTION!") })
        //}
    },[])

    const [OpenPU, setOpenPU] = useState(false);
    const [PopU, setPopU] = useState([])
    useEffect(() => {
        const temp = []
        temp.push(
            <>
            <div className='PopUp-Background' onClick={() => setOpenPU(false)}>
            </div>
            <div className='PopUp' style={{}}>
            <div className='' style={{padding:"20px"}}>
                <button className="close" onClick={() => setOpenPU(false)}>&times;</button>
                {<FindActivites/>}
            </div>
          </div>
          </>
        )
        setPopU(temp);
        console.log(temp)
    }, [OpenPU])

    async function onStartButtonClick() {
        //console.log("CLICKED")
        //Navigate("#")
        console.log(Selected);
        const selected_mdt_index = Selected.indexOf(true);
        //document.querySelectorAll()
        const cards_selector = document.querySelectorAll(".card-select")
        console.log(cards_selector[selected_mdt_index])
        console.log(cards_selector[selected_mdt_index].getAttribute("value"))
        const SelectedMDT = cards_selector[selected_mdt_index].getAttribute("value")
        const response = await fetch('http://localhost:4000/grouphome/selected', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"GroupID": groupId , "ChosenMDT" : SelectedMDT})
        })
        //console.log("YAY")
        //Navigate("/GroupPage/Activities")
        setOpenPU(true)
        console.log(OpenPU)
        console.log(PopU)
        //document.getElementById('root').style.filter = 'blur(5px)'
        Navigate("#")
    }

    return(
        <>
        <div>
            <div>
            {/*temp_try*/}
            </div>
            <div className='d-flex justify-content-center'>
                <div className='selectionActivityGroup'>
                    {shownMDT}
                </div>
                <div className='allMembersOfGroup'>
                    {shownMemDeets}
                </div>
                <div style={{marginRight:"4%"}}>
                    {(IsLeader) ? <button ref={StartButton} onClick={onStartButtonClick} className='btn btn-warning disabled' style={{position: "absolute", bottom:"6%"}}> Start! </button> : <Tooltip placement='top' open={open} title={<h1 style={{ fontSize: "13px", marginBottom:"0px" }}>Only Leader Can Start!</h1>} arrow><button ref={StartButton} className='btn btn-warning disabled' style={{position: "absolute", bottom:"6%"}}> Start! </button></Tooltip>}
                </div>
            </div>
            <div>
                {/* < FindActivites /> */} {(OpenPU)? PopU: null}
            </div>
        </div>
        </>
        
    );
}
export default GroupHome;
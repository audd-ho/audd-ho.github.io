import React, { useEffect } from 'react';
import  '../../App';
import { GroupContext } from '../../contexts/GroupContext';
import { UserContext } from '../../contexts/UserContext';
import { useContext, useState, useRef } from 'react';
//import { NameBox } from '../NameBox';
//import '../Divs.css';
import '../TextField.css';
//import '../Images.css';
import { useNavigate } from 'react-router-dom';
import link_icon from '../../images/link_icon.png';
import back_button from '../../images/back_button.png';
import "./GroupLobby.css"
import { Hidden } from '@mui/material';

function GroupLobby(){
    /*
    async function CheckNGet(){
        const cur_url = window.location.href;
        const group_code = cur_url.slice(-5,);
        //onsole.log(group_code);
        const response = await fetch('http://localhost:4000/joingroup', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"groupCode" : group_code})
        }).then(async (response) => {
            if (response.status == 200) {
                const foundGroup = await response.json()
                console.log(foundGroup)
                return (foundGroup);
                //navigate('/JoinGroup/' + foundGroup.groupCode)
            } else {
                window.location.href("/");
            }
        }).catch(error => {
            window.location.href("/");
        })
    }
    CheckNGet();
    */
    let navigate = useNavigate();

    const [groupDetails, setgroupDetails] = useState();
    const [membersDetails, setmembersDetails] = useState();

    const [membersSelect, setmembersSelect] = useState([]);
    const [userChosen, setuserChosen] = useState();
    const [userChosenName, setuserChosenName] = useState("");

    const [group_id, setgroup_id] = useState();

    useEffect(() =>{
        async function CheckNGetG(){
            const cur_url = window.location.href;
            const group_code = cur_url.slice(-5,);
            //onsole.log(group_code);
            const response = await fetch('http://localhost:4000/joingroup', {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"groupCode" : group_code})
            }).then(async (response) => {
                if (response.status == 200) {
                    const foundGroup = await response.json()
                    setgroupDetails(foundGroup);
                    localStorage.setItem("GroupID", foundGroup.groupID);
                    setgroup_id(foundGroup.groupID)
                } else {
                    //window.location.replace("/");
                    navigate('/')
                }
            }).catch(error => {
                //window.location.replace("/");
                navigate('/')
            })
        }
        CheckNGetG();
    }, [])
    console.log(groupDetails);
    useEffect(()=>{
        async function CheckNGetM(){
            if (ONCE) {return;} // so SSE can take over!! :))
            if(groupDetails == null) {return;}
            const group_id = groupDetails.groupID;
            //onsole.log(group_code);
            const response = await fetch('http://localhost:4000/GroupLobby', {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"groupId" : group_id})
            }).then((response) => response.json())
            setmembersDetails(response);
        }
        CheckNGetM();        
    },[groupDetails])
    console.log(membersDetails);


    const [ONCE, setONCE] = useState(false)
    useEffect(() =>{
        if (membersDetails == null) {return;}
        const temp_select = []
        membersDetails.forEach(member => {
            temp_select.push(
                <button type="button" className="btn btn-success rounded-pill membersButton" key={member.userID} onClick={() => renderConfirmButton(member.userID, member.name)}>{member.name}</button>    
                
            )
        });
        setmembersSelect(temp_select);
        setONCE(true)
    },[membersDetails])

    // Real Time events tracking
    ////const [Listening, setListening] = useState(false);
    useEffect(() =>{
        console.log("1")
        if (ONCE) {
            const events = new EventSource(`http://localhost:4000/GroupLobby/RT:${group_id}`);
            console.log("CONNECTION SECURED!")
            events.onmessage = (event) => {
                console.log("RECEIVING")
                console.log(event)
                //console.log(event.GroupMembersInfo)
                console.log(event.data)
                //const groupUsersInfo = JSON.parse(event.GroupMembersInfo);
                const groupUsersInfo = JSON.parse(event.data);
                setmembersDetails(groupUsersInfo); // trigger the other effect depended on membersDetails
                //alert("NEW PERSON!!")
            }
            return (() => {events.close(); console.log("CLOSED CONNECTION!") })
        }
    },[ONCE])


    const confirmButton = useRef()
    // render the Confirm button, button is rendered if a name button is clicked, called from below
    const renderConfirmButton = (userid, user_name) => {
        //alert(userChosen)
        confirmButton.current.style.visibility = "visible";
        setuserChosen(userid);
        console.log(userid);
        setuserChosenName(user_name);
        console.log(user_name);
        //console.log(userChosen);
    }
    //useEffect(()=>{console.log(userChosen)}, [userChosen])
    
    const ConfirmUser = async () => {
        localStorage.setItem("UserID", userChosen);

        navigate("/GroupPage/Home");
    }

    function AddMemberButton() {
        navigate("/AddUser");
    }
    




    //const { group } = useContext(GroupContext)
    //const { user, setUser } = useContext(UserContext)
    //const group = "TEAM1";
    const user = "0"

    // boolean value to check if user is logged in
    // const [loggedIn, setLoggedIn] = useState(false)
    // boolean value to toggle between showing "Add Member" and "Edit Details"
    const [showEdit, setShowEdit] = useState(false)

    // function to change the button text, called by button below
    const AddOrEdit = () => {
        if (showEdit) {
            return "Edit Details"
        }
        return "Add Member"
    }

    // load user from name chosen
    const loadUserFromName = async (name) => {
        const response = await fetch('http://localhost:4000/' + new URLSearchParams({
                gID: "teamy",
                userName: name
            }))
        //setUser(await response.json())
    }

    // called when a user clicks on the next button (after clicking on a name button)
    // TODO: check if user is already logged in
    const userLogin = async () => {
        await loadUserFromName(userChosen)
        navigate("/Lobby")
    }

    // user clicks on add or edit button
    const clickOnAddOrEditMember = async () => {
        if (showEdit) {
            await loadUserFromName(userChosen)
        } else {
            //setUser({})
        }
        navigate("/AddMember")
    }

    return (
        <div className="">
            <div className='centerLobbyStuff'>
                <div className="d-flex justify-content-center centerLobby">
                    <h1 className='border border-dark rounded' style={{padding:"1%"}}>{ (groupDetails == null) ? "" : "Group Name: " + groupDetails.groupName }</h1>
                </div>
                <div className='d-flex justify-content-center' style={{marginTop:"1%"}}>
                    <h3 className='display-8'>{"Selected: " + userChosenName }</h3>
                </div>
                <div className='d-flex justify-content-center' style={{marginTop:"0%"}}>
                    <div className='d-flex justify-content-center flex-wrap centerUsers' style={{}}>
                        {/*<NameBox setUserChosen={setUserChosen} userChosen={userChosen} setShowEdit={setShowEdit} setShowNextButton={setShowNextButton}/>*/}
                        {membersSelect}
                    </div>
                </div>
            </div>
            <div className=''>
                <div className='d-flex justify-content-end foots' style={{}}>
                    <div className="">
                        <button className="btn btn-warning" ref={confirmButton} style={{visibility:"hidden"}} onClick={ConfirmUser}>Confirm</button>
                    </div>
                </div>
                <div className='d-flex justify-content-center align-items-end add-members-location'>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-light rounded-circle border border-dark border-5 addmembersButton" onClick={AddMemberButton}></button>
                    </div>
                </div>
                <span className='d-flex justify-content-center'>
                    <p className='lead'><strong> Add Member </strong></p>
                    </span>
            </div>
        </div>
    )
}
export default GroupLobby;
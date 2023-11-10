import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import  '../../App';
import { ActivityBox } from '../ActivityBox';
//import { GroupContext } from '../../contexts/GroupContext';
//import { UserContext } from '../../contexts/UserContext';
import '../Divs.css';
import '../TextField.css';
import { useNavigate } from 'react-router-dom';
//import back_button from '../../images/back_button.png';

const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ActivityPage(){
    let navigate = useNavigate();
    //const { group } = useContext(GroupContext);
    //const { user } = useContext(UserContext);

    const userId = localStorage.getItem("UserID");
    const groupId = localStorage.getItem("GroupID");

    const [group, setgroup] = useState();
    const [user, setuser] = useState();

    useEffect(() =>{
        async function get_both(){
            if ((userId == null)||(groupId == null)) {navigate('/');}
            const response = await fetch('http://localhost:4000/GroupLayout', {
                method: "POST",
                mode: "cors",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"groupID" : groupId, "userID" : userId})
            }).then(async (response) => {
                if (response.status == 200) {
                    const U_G_details = await response.json()
                    console.log(U_G_details)
                    const userInfo = U_G_details.Uinfo;
                    const groupInfo = U_G_details.Ginfo;
                    /*
                    setuserName(userInfo.name);
                    setgroupCode(groupInfo.groupCode);
                    setgroupName(groupInfo.groupName);
                    */
                    setgroup(groupInfo)
                    setuser(userInfo)
                    
                }
            })
        }
    },[])

    const activityList = group.activityList

    // format the date for display
    function formatDate(date) {
        if (date) {
            return [
                date.getDate().toString().padStart(2, '0'),
                monthName[date.getMonth()].padStart(2, '0'),
                date.getFullYear()
            ].join(' ');
        }
    }

    // format the time for display
    function formatTime(date) {
        if (date) {
            return [
                date.getHours().toString().padStart(2, '0'),
                date.getMinutes().toString().padStart(2, '0'),
            ].join(':');
        }
    }

    // display back button only for leader
    const renderBackButton = () => {
        if (user.leader) {
            return (
                <div className="header">
                    <img id='back' src={require("../cat_for_fun.png")} onClick={() => navigate('/Lobby')}/>
                </div>
            )
        }
    }


    return (
        <div>
            {renderBackButton()}
            <div className="box-center" style={{textAlign: 'center'}}>
                <h1 id='groupname'>{group.groupName}</h1>
            </div>
            <div className="container-details">
                <h2>Details:</h2>
                <p>{formatDate(new Date(group.meetDateTime[group.chosenDateTimeIndex]))}</p>
                <p>{formatTime(new Date(group.meetDateTime[group.chosenDateTimeIndex]))}</p>
                <h1 id='activities'>Activities</h1>
            </div>
            <div className="container-horizontal-scroll" style={{marginTop: '250px'}}> {/* horizontal scrolling box for activities */}
                {activityList.map((activity, i) => 
                    <ActivityBox key={i} activity={activity}/>
                )}
            </div>
        </div>
    );
}
export default ActivityPage;
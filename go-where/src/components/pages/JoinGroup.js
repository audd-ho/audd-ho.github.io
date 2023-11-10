import React, { useState, useContext, useRef } from 'react';
//import { useLocation, useOutletContext } from 'react-router-dom';
import  '../../App';
//import '../Divs.css';
import '../TextField.css';
//import '../Button.css';
import { useNavigate } from 'react-router-dom';
import { GroupContext } from '../../contexts/GroupContext';
import back_button from '../../images/back_button.png';
//import { InvalidInputsPopups } from '../InvalidInputsPopups.js';
//import Popup from 'reactjs-popup';
//import 'reactjs-popup/dist/index.css';
import '../FooterButtons.css';
import { Link } from 'react-router-dom';
import './JoinGroup.css';
import { Tooltip } from '@mui/material';

function JoinGroup(){
    /*
    const location = useLocation();
    const [curUrl, setcurURL] = useOutletContext();
    console.log(curUrl)
    setcurURL(location.pathname);
    console.log(curUrl)
    //console.log(curUrl)
    //alert(curUrl)
    */
    let navigate = useNavigate();

    const code_input_textbox = useRef();

    // for invalid inputs -> pass to InvalidInputsPopups
    const [open, setOpen] = useState(false);
    //const [message, setMessage] = useState('')

    // valid inputs -> put in context
    //const { setGroup } = useContext(GroupContext);
    const [groupCode, setGroupCode] = useState("")

    // get group if it exists, handle errors from backend
    const checkGroupCode = async() => {
        const response = await fetch('http://localhost:4000/joingroup', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"groupCode" : groupCode})
        }).then(async (response) => {
            if (response.status == 200) {
                const foundGroup = await response.json()
                //setGroup(foundGroup)
                console.log(foundGroup)
                navigate('/JoinGroup/' + foundGroup.groupCode)
            } else {
                //setMessage('Please enter a valid group code!')
                //setOpen(true)
                setOpen(true);
                code_input_textbox.current.style.backgroundColor = "#FF8383";
            }
        }).catch(error => {
            console.log('checkGroupCode error: ' + error)
            setOpen(true);
            code_input_textbox.current.style.backgroundColor = "#FF8383";
        })
        
        /*
        }).then((res) => {return res.json();})
        .catch(error => {
            console.log('checkGroupCode error: ' + error)
            setMessage('Please enter a valid group code!')
            setOpen(true)
            return;
        })

        console.log(response)
        */
    }


    return (
        <div className='d-flex justify-content-center' style={{}}>
            {/*
            <div className="header">
                <img id='back' src={back_button} onClick={() => navigate('/')}/>
            </div>
            */}
            <div className="centerJoin" style={{marginLeft:"4%"}}>
                <div className="container-left">
                    <h1 style={{paddingTop: '30px', fontWeight:"bold"}}>Join a group!</h1>
                </div>
                <div className='centerExtraJoin' style={{paddingTop: '300px'}}>
                <Tooltip title={<p className='lead' style={{height:"13px"}}> Invalid Group Code! </p>} open={open} arrow><input ref={code_input_textbox} className='form-control form-rounded code-input' type="text"
                        onChange={(e) => setGroupCode(e.target.value)}
                        placeholder="Enter Group Code"/></Tooltip>
                        <div></div>
                    <button className="btn btn-warning join-button" onClick={() => checkGroupCode()}>Join Group</button>
                </div>
            </div>
            {/* <InvalidInputsPopups open={open} setOpen={setOpen} message={message}/> */}
            <div className="footer">
                <div className="backDiv">
                    <Link to='/'>
                        <button className="btn btn-warning">Back</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default JoinGroup;
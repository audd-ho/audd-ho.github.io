import { Link, Outlet, useNavigate, useLocation  } from "react-router-dom";
import { useEffect, useState } from "react";

function HomeLayout(){

    const userId = localStorage.getItem("UserID");
    const groupId = localStorage.getItem("GroupID");

    console.log(userId)
    console.log(groupId)

    let navigate = useNavigate();

    /*
    async function getDeets(){
        const response = await fetch('http://localhost:4000/HomeLayout', {
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
            } else {
                navigate('/')
            }
        }).catch(error => {
            navigate('/')
        })
    }
    //getDeets();
    */
   /*
    const location = useLocation();
    const [curURL, setcurURL] = useState("")
    useEffect(()=>{
        setcurURL(location.pathname)
        console.log(curURL)
    },[])
    */
    function checkoOnce(){ // not the best check but yeaaa...
        if (userId==null || groupId==null){return;}
        navigate('/GroupPage/Home');
    }
    useEffect(()=>{
        checkoOnce();
        //console.log(curURL)
    },[userId])
    //console.log(curURL)
    return(
        <>
        <nav className="navbar navbar-expand-lg" style={{position: "sticky", top: "0", zIndex: "9999", backgroundColor:"#FAF9F6"}}>
            <div className="container-fluid">
                <Link to="/"> <button className="btn btn-dark"> GoWhere </button> </Link>
                <div className="collapse navbar-collapse" idname="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item"><Link to="/" className="nav-link active"><button className="btn btn-light">Home</button></Link></li>
                        <li className="nav-item"><Link to="joingroup" className="nav-link"><button className="btn btn-light">Join Group</button></Link></li>
                        <li className="nav-item"><Link to="creategroup" className="nav-link"><button className="btn btn-light">Create Group</button></Link></li>
                        {/*
                        <li className="nav-item"><Link to="/" className="nav-link active">Home</Link></li>
                        <li className="nav-item"><Link to="/joingroup" className="nav-link">Join Group</Link></li>
                        <li className="nav-item"><Link to="/creategroup" className="nav-link">Create Group</Link></li>
                        */}
                    </ul>
                </div>
            </div>
        </nav>
        <Outlet/>
        {/* <Outlet context={[curURL, setcurURL]}/> */}
        </>
    );
}

export default HomeLayout;
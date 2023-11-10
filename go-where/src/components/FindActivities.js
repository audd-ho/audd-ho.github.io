import React, { useState, useEffect, useRef } from 'react';
//import '@geoapify/geocoder-autocomplete/styles/minimal.css';
//import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import './FindActivities.css'


function FindActivites(){

    const [Radius, setRadius] = useState("1000")
    const [ButtonDisabled, setButtonDisabled] = useState(true)

    /*
    //const [Accomodation, setAccomodation] = useState("0");
    const [Commercial, setCommercial] = useState("0");
    const [Catering, setCatering] = useState("0");
    //const [Education, setEducation] = useState("0");
    const [Entertainment, setEntertainment] = useState("0");
    //const [Healthcare, setHealthcare] = useState("0");
    const [Leisure, setLeisure] = useState("0");
    const [Parking, setParking] = useState("0");
    const [Pet, setPet] = useState("0");
    const [Rental, setRental] = useState("0");
    const [Service, setService] = useState("0");
    const [Tourism, setTourism] = useState("0");
    //const [Religion, setReligion] = useState("0");
    //const [Adult, setAdult] = useState("0");
    //const [Building, setBuilding] = useState("0");
    const [Sport, setSport] = useState("0");
    const [PublicTransport, setPublicTransport] = useState("0");
    */
    const possible_activity = ["Commercial", "Catering", "Entertainment", "Leisure", "Parking", "Pet", "Rental", "Service", "Tourism", "Sport", "Public Transport"]
    const num_activities = possible_activity.length
    let checkbox_array = []
    for (let i = 0; i < num_activities; i++) { checkbox_array.push(false) }
    const [Activities, setActivities] = useState(checkbox_array);

    //console.log(Activities);

    const findchoices = useRef();
    const handleOnCheckboxChange = (event, activity_num) => {
        //console.log(Activities);
        const temp_checkbox = [...Activities]
        temp_checkbox[activity_num] = !(Activities[activity_num])
        console.log(temp_checkbox);
        setActivities(temp_checkbox);
        //findchoices.current.disabled = true;
        setButtonDisabled(true)
        if ((Radius >= 100) && (Radius <= 5000)) {
            for (let i = 0; i < num_activities; i++)
            {
                if (temp_checkbox[i]) {setButtonDisabled(false); return;}
            }
        }
    };

    function handleRadiusChange(e)
    {
        const new_radius = e.target.value;
        setRadius(new_radius);
        setButtonDisabled(true);
        if ((new_radius >= 100) && (new_radius <= 5000)) {
            for (let i = 0; i < num_activities; i++)
            {
                if (Activities[i]) {setButtonDisabled(false); return;}
            }
        }
    }

    const return_array = []

    for (let i = 0; i < num_activities; i++)
    {
        return_array.push(
            <div key={"checkbox_" + i} className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" onChange={(e) => handleOnCheckboxChange(e, i)} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
                {possible_activity[i]}
            </label>
            </div>
        )
    }

    const [ActivitiesCard, setActivitiesCard] = useState([]) 
    async function GetActivities()
    {
        const userPreferences = {
            "Activitites TF list" : Activities,
            "Radius": Radius
        }
        //console.log("HIIIIII")
        const places_result = await fetch('/GroupPage', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userPreferences)
        }).then((response) => {return response.json()});

        const num_places = places_result.length

        if (num_places === 0) {console.log("Nothing that fits that description");}
        else {console.log(places_result);}

        const card_info = []
        for (let i=0; i < num_places; i++)
        {
            if (Object.hasOwn(places_result[i].properties, "name")){
                console.log(places_result[i].properties.name)
                
                //img src={require("./copy_link_icon.png")}
                card_info.push(
                    <div key={places_result[i].properties.name} className="card" style={{minWidth: "300px", width: "18rem"}}>
                    <img src={require("./cat_for_fun.png")} className="card-img-top" alt="CAT!!" />
                    <div className="card-body">
                        <h5 className="card-title">{places_result[i].properties.name}</h5>
                        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    </div>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">{places_result[i].properties.categories[0]}</li>
                        <li className="list-group-item">A second item</li>
                        <li className="list-group-item">A third item</li>
                    </ul>
                    <div className="card-body">
                        <a href="#" className="card-link">Card link</a> {/* maybe just a google search link? a get request to google, and auto open on another page?  as for precise location... can search in google too! add in the search, but the midpoint need to find ah... so need find midpoint + closest landmark to it!! or smth... then link to this... so no landmark then bo bian need increase radius(another radius to find landmark from the midpoint lat,lon) first, then search based on radius from landmark maybe*/}
                        <a href="#" className="card-link">Another link</a>
                    </div>
                    </div>
                )
            }
        }
        const total_card_info = []
        total_card_info.push(
            <>
            <h1 className="font-weight-light"> A good location is: Marina Bay Sands(?)</h1>
            <h2 className="font-weight-light"> Activities around the location!! </h2>
            <div className="container-fluid py-2 activities-scroll-box" style={{overflow: "auto"}}>
            <div className="d-flex flex-row flex-nowrap">
                {card_info}
            </div>
            </div>
            </>
        )
        setActivitiesCard(total_card_info);
    }


    return (
        <>
            <label htmlFor="getradius"> Radius of Search(in metres): </label>
            <input type="number" name="getradius" value={Radius} onChange={handleRadiusChange} required></input>
            {return_array}            
            <button ref={findchoices} className='btn btn-danger' disabled={ButtonDisabled} onClick={GetActivities}> For Activities! </button>
            {ActivitiesCard}
            <h3>err for now is like this...</h3>
        </>
    );
}

export default FindActivites;
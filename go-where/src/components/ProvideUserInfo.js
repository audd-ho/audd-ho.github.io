import React, { useState, useEffect, useRef } from 'react';
//import '@geoapify/geocoder-autocomplete/styles/minimal.css';
//import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import './ProvideUserInfo.css'
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';


export const ProvideUserInfo = (props) => {
    //console.log(props.curUserData.AddressName)
    const [Name, setName] = useState(props.curUserData.Name);
    const [AddressName, setAddressName] = useState(props.curUserData.AddressName);
    const [LatLon, setLatLon] = useState (props.curUserData.LatLon);
    const [SpecificAddressInfo, setSpecificAddressInfo] = useState(props.curUserData.SpecificAddressInfo);

    /*
    useEffect(()=>{
        setName(props.curUserData.Name);
        setAddressName(props.curUserData.AddressName);
        setLatLon(props.curUserData.LatLon);
        setSpecificAddressInfo(props.curUserData.SpecificAddressInfo);
    },[props.curUserData.Name, props.curUserData.AddressName, props.curUserData.LatLon, props.curUserData.SpecificAddressInfo])
    */

    const [autocompleteInput, setautocompleteInput] = useState(0)
/*
    props.userData = {
        "name" : Name,
        "addressName" : AddressName,
        "LatLon" : LatLon,
        "specificAddressInfo" : SpecificAddressInfo
    }
*/
    const [userData, setuserData] = useState({
        "Name" : Name,
        "AddressName" : AddressName,
        "LatLon" : LatLon,
        "SpecificAddressInfo" : SpecificAddressInfo
    })

    useEffect(()=>{
        setuserData({
            "Name" : Name,
            "AddressName" : AddressName,
            "LatLon" : LatLon,
            "SpecificAddressInfo" : SpecificAddressInfo
        })
    }
    ,[Name,AddressName,LatLon,SpecificAddressInfo])

    useEffect (() => {
        //console.log(userData)
        props.dataChange(userData)  
    }, [userData])
/*
    async function PassInfo() {
        const userData = {
            //"groupID" : props.groupID,
            //"leader" : props.leader,
            "name" : Name,
            "addressName" : AddressName,
            "LatLon" : LatLon,
            "specificAddressInfo" : SpecificAddressInfo
        }
        fetch('/adduser', {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userData)
        })
        
        console.log(Name)
        console.log(AddressName)
        console.log(LatLon)
        console.log(SpecificAddressInfo)
        //const ip_loc = "https://api.geoapify.com/v1/geocode/reverse?lat=" + LatLon["Lat"] + "&lon=" + LatLon["Lon"] + "&lang=en&apiKey=5e1e08a5904145afbf5860ffcf26a440"
        //const addi_info = await fetch(ip_loc).then((resp) => resp.json());
        //console.log(addi_info);
        console.log(props.leader)

        
    }
*/

    /*
    useEffect(() => {
        async function IPAddress() {
            const ip_response = await fetch('https://geolocation-db.com/json/')
            .then((resp) => resp.json());
            setLatLon({"Lat" : ip_response["latitude"], "Lon" : ip_response["longitude"]});
            //console.log(LatLon);
        }
        IPAddress();
    }, [])
    */

    /*
    async function IPAddress() {
        const ip_response = await fetch('https://geolocation-db.com/json/')
        .then((resp) => resp.json());
        console.log(ip_response);
        setLatLon({"Lat" : ip_response["latitude"], "Lon" : ip_response["longitude"]}); // cannot use usestate just after setting it in an async since usestate is also an async
        console.log(LatLon);
        //const ip_location = "https://api.geoapify.com/v1/geocode/reverse?lat=" + LatLon["Lat"] + "&lon=" + LatLon["Lon"] + "&lang=en&apiKey=5e1e08a5904145afbf5860ffcf26a440"
        const ip_location = "https://api.geoapify.com/v1/geocode/reverse?lat=" + ip_response["latitude"] + "&lon=" + ip_response["longitude"] + "&lang=en&apiKey=5e1e08a5904145afbf5860ffcf26a440"
        const add_info = await fetch(ip_location).then((resp) => resp.json());
        console.log(add_info)
        //console.log(add_info["features"][0]["properties"]["address_line1"])
        //console.log(autocomplete_ref.current.value)
        //autocomplete_ref.current.value = add_info["features"][0]["properties"]["address_line1"];
        //console.log(autocomplete_ref.current)
        //console.log(autocompleteInput.getValue())
        autocompleteInput.setValue(add_info["features"][0]["properties"]["formatted"])
        setAddressName(add_info["features"][0]["properties"]["formatted"])
        setSpecificAddressInfo(add_info["features"][0])
        console.log(add_info["features"][0]["properties"]["formatted"])
        console.log(navigator.geolocation.getCurrentPosition(showPosition));
    }
    */

    async function geoAddress() {
        const position = await getPostion();
        console.log(position)
        const geo_location = "https://api.geoapify.com/v1/geocode/reverse?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&lang=en&apiKey=5e1e08a5904145afbf5860ffcf26a440"
        const add_info = await fetch(geo_location).then((resp) => resp.json());
        console.log(add_info)
        autocompleteInput.setValue(add_info["features"][0]["properties"]["formatted"])
        //setLatLon({"Lat" : position.coords.latitude, "Lon" : position.coords.longitude});
        setLatLon({"Lat" : position.coords.latitude, "Lon" : position.coords.longitude});
        setAddressName(add_info["features"][0]["properties"]["formatted"])
        setSpecificAddressInfo(add_info["features"][0])
        console.log(add_info["features"][0]["properties"]["formatted"])
        //console.log(navigator.geolocation.getCurrentPosition())
    }

    function getPostion(){
        //console.log("hi")
        return new Promise ((resolve, reject) => {(navigator.geolocation.getCurrentPosition(resolve, reject));});
    }

    /*
    function setGeoPosition(position) {
        //console.log(position)
        //console.log("Latitude: " + position.coords.latitude)
        //console.log("Longitude: " + position.coords.longitude)
        console.log("hi")
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        setLatLon({"Lat" : lat, "Lon" : lon});
        console.log("hi")   
        //return lat, lon;
    }
    */

    const autocomplete_ref = useRef();
    

    useEffect(() => {  
        const autocomplete = new GeocoderAutocomplete(
            autocomplete_ref.current, 
            '5e1e08a5904145afbf5860ffcf26a440', 
            { lang:"en" });
        
        
        autocomplete.addFilterByCountry(['sg']);
        autocomplete.setValue(props.curUserData.AddressName)

        autocomplete.on('select', (location) => {
            console.log(location)
            //console.log(location.json())
            console.log(autocomplete.getValue())
            setAddressName(autocomplete.getValue())
            setSpecificAddressInfo(location)
            if (location != null) {setLatLon({ ["Lat"]: location["geometry"]["coordinates"][1] , ["Lon"]: location["geometry"]["coordinates"][0] })}
            else {setLatLon({ ["Lat"]: "" , ["Lon"]: "" })}
        });

        autocomplete.on('suggestions', (suggestions) => {
            console.log(suggestions)
        });

        setautocompleteInput(autocomplete)
    }, []);

    return (
        <>
            {/* <button onClick={IPAddress} className='btn btn-primary'> TRY IP ADDRESS</button> */}
            <p style={{textAlign:"left", paddingLeft:"32px", fontWeight:"bold", fontSize:"25px"}}>Name</p>
            <input name='username' className='form-control form-rounded' style={{marginLeft:"32px", width:"84%", padding:"4px"}} type='text' placeholder="  Enter a Username" onChange={(e) => {setName(e.target.value)}} value={Name}></input>
            <br/>
            <p style={{textAlign:"left", paddingLeft:"32px", fontWeight:"bold", fontSize:"25px", paddingBottom:"0px"}}>Address</p>
            <div ref={autocomplete_ref} className="autocomplete-container " style={{padding:"3%", width:"400px", paddingTop:"0px"}}></div>
            <div style={{display:"inline-flex", paddingLeft:"0%", paddingRight:"0%"}}>
            <button className='btn btn-light btn-block' onClick={geoAddress}> Get Address via Geolocation Address </button>
            {/* <button className='btn btn-primary' onClick={IPAddress}> get address via IP address </button> */}
            {/* <button className='btn btn-info' onClick={PassInfo}> Confirm Address </button> */}
            </div>
        </>
    )
    /*
    function onPlaceSelect(value) {
        console.log(value);
        alert("HI");
        setAddress("POPSICLE");

    }
    const onsuggestionsChange = (values) => {
        console.log(values);
        alert("HIIII");
    }
    */
    //return <button onClick={props.thefunc}> something alert </button>
    /*
    return (
        <>
            <p> HI </p>
            <GeoapifyContext apiKey="5e1e08a5904145afbf5860ffcf26a440">
                <GeoapifyGeocoderAutocomplete
                    placeholder="Enter your address here!"
                    value={Address}
                    //filterByCountryCode="Sg"
                    //countryCodes="sg"
                    limit="5"
                    placeSelect={props.thefunc}
                    suggestionsChange={onsuggestionsChange}
                />  
            </GeoapifyContext>
        </>
    );
    */
}

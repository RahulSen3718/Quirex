import React, { useEffect } from "react";
// import {useNavigate} from 'react-router-dom';
import NavBar from "./components/landingComponents/NavBar";
const NotFound=()=>{
//  const navigate=useNavigate();
 useEffect(()=>{
//   navigate('/login');
 },[])

    return (<>
    <NavBar/>
    <div className="row">
        <div className="col-sm-3"></div>
        <div className="col-sm-7">
            <img  src="/img/notfound.png" />
        </div>
        <div className="col-sm-2"></div>
    </div>
    </>) 
}

export default NotFound;
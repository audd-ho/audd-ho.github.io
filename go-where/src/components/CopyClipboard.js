import "./CopyClipboardButton.css"
import { useRef, useState } from "react";
import Tooltip from '@mui/material/Tooltip';

export const CopyToClipboard = (props) => {
    //const link_img_size = 20;
    //const toolTip = useRef();
    const [ToolTipTitle, setToolTipTitle] = useState("Copy Group Code: " + props.item_for_copy)
    function copyItem() {
        navigator.clipboard.writeText(props.item_for_copy);
        changedToolTip();
    }
    function defaultToolTip() {
        setToolTipTitle("Copy Group Code: " + props.item_for_copy)
    }
    function changedToolTip() {
        setToolTipTitle("Copied: " + props.item_for_copy)
    }
    /*
    function displayToolTip() {
        toolTip.current.innerHTML = "Copy to clipboard";
    }
    */
    return (
        <Tooltip title={ToolTipTitle} arrow PopperProps={{style:{zIndex:10000}}}><button className="btn btn-light clipboardbutton" style={{}} onClick={copyItem} onMouseEnter={defaultToolTip}></button></Tooltip>
    )
}

//        <Tooltip title={ToolTipTitle} arrow PopperProps={{style:{zIndex:10000}}}><button className="btn btn-light clipboardbutton" style={{}} onClick={copyItem} onMouseEnter={defaultToolTip}><img src={require("./copy_link_icon.png")} alt="Copy Group Code/Link" width={props.link_img_size} height={props.link_img_size}/></button></Tooltip>


//<button className="btn btn-light clipboardbutton" style={{}} onClick={copyItem}><img src={require("./copy_link_icon.png")} alt="Copy Group Code/Link" width={props.link_img_size} height={props.link_img_size} data-toggle="tooltip" data-placement="top" title="Copy Group Code" data-delay='{"show":"0", "hide":"100"}'/></button>

//<button className="btn btn-light clipboardbutton" style={{}} onClick={copyItem}><img src={require("./copy_link_icon.png")} alt="Copy Group Code/Link" width={props.link_img_size} height={props.link_img_size} data-toggle="tooltip" data-placement="top" title="Copy Group Code" data-delay='{"show":"0", "hide":"100"}'/></button>

// <button className="btn btn-light clipboardbutton" style={{}} onClick={copyItem}><img src={require("./copy_link_icon.png")} alt="Copy Group Code/Link" width={props.link_img_size} height={props.link_img_size} onMouseOut={displayToolTip}/><span class="" ref={toolTip} style={{visibility: "hidden"}}>Copy to clipboard</span></button>

//<Tooltip title="Add" arrow><button className="btn btn-light clipboardbutton" style={{}} onClick={copyItem}><img src={require("./copy_link_icon.png")} alt="Copy Group Code/Link" width={props.link_img_size} height={props.link_img_size} onMouseOut={displayToolTip}/><span class="" ref={toolTip} style={{visibility: "hidden"}}>Copy to clipboard</span></button></Tooltip>


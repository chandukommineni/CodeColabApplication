import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import { ACTIONS } from "../Action";

const Editor = ({socketRef,roomId,onCodeChange}) => {
  const [language,setLanguage]=useState("python")
  const editorRef=useRef(null)
  const handleCompiling=()=>{

  }
  
  useEffect(() => {
    function init() {
     editorRef.current= CodeMirror.fromTextArea(document.getElementById("realTimeEditor"), {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });
      editorRef.current.on("change",(instance,changes)=>{
        const {origin}=changes
        const code=instance.getValue()
        onCodeChange(code)
        if(origin!=="setValue"){
          socketRef.current.emit(ACTIONS.CODE_CHANGE,{roomId,code})
        }
      })

    }

    init();
  }, []);

  useEffect(()=>{
    if (socketRef.current){
      socketRef.current.on(ACTIONS.CODE_CHANGE,({code})=>{
        if (code!==null){
          editorRef.current.setValue(code)
        }
      })
    }
    return()=>{
      socketRef.current.off(ACTIONS.CODE_CHANGE)
    }

  },[socketRef.current])

  return (
    <div className="editorContainer">
      <textarea id="realTimeEditor"></textarea>

    {/* <div className="outputContainer">
          <div className="outputButtons">
            <button onClick={handleCompiling}>Compile</button>
            <select id="exampleSelect" value={language} onChange={(e)=>setLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
            
         </div>
      
          <div className="outputText">
            <textarea  id="output"></textarea>
          </div>

    </div> */}
    
    
    </div>
    
  );
};

export default Editor;

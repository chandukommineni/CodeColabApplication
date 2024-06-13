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
  const handleCompiling = () => {
    document.getElementById("output").value="Compiling ....."

    const code = editorRef.current.getValue();
    const input=document.getElementById('input').value
    console.log(input)
    fetch('http://localhost:5000/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language,input,roomId}),
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from the backend
       
        if (data.error || data.errorDescription!=="Accepted"){
          document.getElementById("output").value=atob(data.error)
        }
        else{

          document.getElementById("output").value=(atob(data.output))

        }
       
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  
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

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('output', (data) => {
        const output = data.error ? atob(data.error) : atob(data.output);
        document.getElementById("output").value = output;
      });
    }
    return () => {
      socketRef.current.off('output');
    };
  }, [socketRef.current]);

  return (
    <div className="editorContainer">
       <textarea id="realTimeEditor" ></textarea>

    <div className="outputContainer">
          <div className="outputButtons">
            <button onClick={handleCompiling} className="btn compilerBtn">Compile</button>
            <select id="exampleSelect" value={language} onChange={(e)=>setLanguage(e.target.value)} className="btn langBtn">
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option> 
          </select>

          <div className="outputText">
            <textarea  id="output" className="output" readOnly={true}>
            
            </textarea>
          </div>
            
         </div>

         <div className="inputO " >
         <button className="btn InputBtnO">Input</button>
         <div className="inputTextO">

         <textarea  id="input"  className="inputBoxO"></textarea>

         </div>
         
         </div>
      
         

    </div>
    
    
    </div>
    
  );
};

export default Editor;

import React from "react";
import Avatar from "react-avatar";
const Client = ({username}) => {
 const colors = ['Blue', 'green', 'orange'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return (
    <div className="client">
        <Avatar name={username} size={50} round="14px" color={randomColor}/>
        <span className="userName">{username}</span>
    </div>
  )
};

export default Client;

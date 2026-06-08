module.exports = function loginserver(ws, data) {
    console.log("CONECTING USERS");

    ws.send(JSON.stringify({
        message: "userconected",
        email: data.email,
        password:data.password
        
    }));
};

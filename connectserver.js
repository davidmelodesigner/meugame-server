const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

module.exports = function connectserver(req, res) {
    wss.on("connection", (ws) => {

            ws.on("message", (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.message == "startserver") {
                    inicServer(ws, data);
                }
            });
        
            
        
        });

};

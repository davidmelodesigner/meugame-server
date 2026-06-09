module.exports = function connectserver(req, res) {
    ws.send(JSON.stringify({
                message: "serverconnected"
            }));

};

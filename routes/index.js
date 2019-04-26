const express = require("express");
const router = express.Router();

router.get('/', function (req, res, next) {
    res.sendStatus(200);
});

router.get("/hirefire/"+`${process.env.HIREFIRE_TOKEN}`+'/info', (req, res) => {
    let audioQueue = req.app.get('audioQueue');
    audioQueue.queueSize(function (err, size) {
        if (err) {
            return res.status(400).json([{"error" : err, }]);
        }else{
            return res.status(200).json([{"name" : "web", "quantity": Number(size)}]);
        }
    });
});

module.exports = router;

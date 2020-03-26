const CallsModel = require('./calls.model');
const crypto = require('crypto');

exports.createCall = (req, res, next) => {
    if(req.body.url === undefined){
        res.status(403).send({ err: "Error creating call, missing url" })
    } else {
        CallsModel.createCall(req.body)
            .then((result) => {
                res.status(200).send(result);
            })
            .catch(err => {
                res.status(403).send({ err: "Error creating call" })
            })
    }
}

exports.uniqueUrl = (req, res, next) => {
    if(req.body.inviteLink === undefined) {
        res.status(403).send({ err: "Error creating call, missing invite link" })
    } else {
        while(true){
            let url = crypto.randomBytes(5).toString('base64');
            CallsModel.findByUrl(url)
                .then((exist) => {
                    if (exist === undefined || exist === null) {
                        req.body = {
                            url: url,
                            inviteLink: req.body.inviteLink
                        }
                        return next();
                    }
                })
                .catch(err => {})
        }
    }
}

exports.listCalls = (req, res) => {
    CallsModel.listCalls()
        .then((result) => {
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(403).send({ err: "Error get urls calls" })
        })
};

exports.getByUrl = (req, res) => {
    CallsModel.findByUrl(req.params.url)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(403).send({ err: "Error get call" })
        })
};

// exports.removeById = (req, res) => {
//     CallsModel.removeById(req.params.userId)
//         .then((result)=>{
//             res.status(201).send(result);
//         })
//         .catch(err => {
//             res.status(403).send({ err: "Error removing profile" })
//         })
// };
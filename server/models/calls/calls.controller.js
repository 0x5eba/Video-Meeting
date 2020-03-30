const CallsModel = require('./calls.model');
const crypto = require('crypto');

exports.createCall = (req, res, next) => {
    if(req.body.url === undefined){
        res.status(403).send({ err: "Error creating call, missing url" })
    } else {
        CallsModel.createCall(req.body.url)
            .then((result) => {
                res.status(200).send(result)
            })
            .catch((err) => {
                res.status(403).send({ err: "Error creating call" })
            })
    }
}

exports.uniqueUrl = (req, res, next) => {
    let url = req.body.url
    if(url === undefined || url.length === 0){
        url = crypto.randomBytes(5).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    }
    CallsModel.findByUrl(url)
        .then((exist) => {
            if (exist === undefined || exist === null) {
                req.body = {
                    url: url,
                }
                return next();
            }
        })
        .catch(err => {})
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
            if(result !== null){
                res.status(200).send(result);
            } else {
                res.status(403).send({ err: "Error get call" })
            }
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
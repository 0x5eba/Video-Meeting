const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
mongoose.set('useCreateIndex', true);
var SchemaTypes = mongoose.Schema.Types;

const CallsModel = new mongoose.Schema({
    url: { type: String, trim: true, require: true },
    // inviteLink: { type: String, default: "" }, // sdp
    // lastSeen: { type: Number, default: 0 },
})

const Calls = mongoose.model('Call', CallsModel);


exports.findByUrl = (url) => {
    return new Promise((resolve, reject) => {
        Calls.findOne({ url: url }, function (err, user) {
            if (err) reject(err);
            resolve(user);
        });
    })
};

exports.createCall = (url) => {
    return new Promise((resolve, reject) => {
        const call = new Calls({ url: url });
        call.save(function (err, newdata) {
            if (err) return reject(err);
            resolve(newdata);
        });
    })
};

exports.listCalls = () => {
    return new Promise((resolve, reject) => {
        Calls.find({}, { url: 1 }, function (err, calls) {
            if (err) reject(err);
            resolve(calls);
        })
    });
};

// exports.removeById = (userId) => {
//     return new Promise((resolve, reject) => {
//         Profile.remove({_id: userId}, (err, profile) => {
//             if (err) reject(err);
//             resolve(profile);
//         });
//     });
// };
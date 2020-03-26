const CallController = require('./calls.controller');

exports.routesConfig = function (app) {
    app.post('/api/call/create', [
        CallController.uniqueUrl,
        CallController.createCall,
    ]);
    app.get('/api/calls', [
        CallController.listCalls
    ]);
    app.get('/api/call/:url', [
        CallController.getByUrl
    ]);
};

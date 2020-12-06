const express = require('express');
const app = express();
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const path = require('path');

const auth = require('./modules/authentication');
const disease = require('./modules/disease');
const symptom = require('./modules/symptom');
const practitioner = require('./modules/practitioner');
const admin = require('./modules/admin');
const appointment = require('./modules/appointment');
const payment = require('./modules/payment');

app.use(express.json());
app.use(session({
    cookie: { maxAge: 604800000, httpOnly: false },
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 604800000 // prune expired entries every 24h
    }),
    resave: true,
    secret: 'Shigeo Tokuda'
}))
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(function (req, res, next) {
    res.set({
        'content-type': 'application/json',
        'access-control-allow-headers': 'origin, x-requested-with, content-type, accept',
        'access-control-allow-origin': '*',
        // 'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
    });
    next();
});
app.get('*', function(req, res){
    res.sendFile(path.join(__dirname + '/../client/public/404.html'));
    res.status(404);
    res.set({'content-type': 'text/html'});
});

// api
app.post("/user/register", auth.registerAccount);
app.post("/user/login", auth.loginAccount);
app.post("/user/logout", auth.logout);
app.post("/user/forgetPassword", auth.forgetPassword);
app.post("/user/resetPassword/:userToken", auth.resetPassword);
app.post("/user/checkEmailExist", auth.checkEmailExist);

app.post("/admin/appointments/all", admin.listAllAppointments);
app.post("/admin/practitioners/all", admin.listPractitioners);
app.post("/admin/patients/all", admin.listPatients);
app.post("/admin/appointments/all", appointment.queryAllAppointments);

app.post("/appointment/create", appointment.createAppointment);

app.post("/appointment/getAvailableTime", appointment.getAvailableHours);
app.post("/appointment/findRoom", appointment.findRoom);


app.post("/symptom/all", symptom.queryAllSymptoms);

app.post("/disease/findDiseases", disease.findDiseasesBySymptoms);
app.post("/disease/all", disease.queryAllDiseases);

app.post("/practitioner/all", practitioner.queryAllPractitioners)
app.post("/practitioner/findByDisease", practitioner.findPractitionerByDisease)

app.post("/payment/invoice", payment.generateInvoice)

module.exports = app;

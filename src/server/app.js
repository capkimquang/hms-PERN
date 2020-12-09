const express = require('express');
const app = express();
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const path = require('path');

const auth = require('./modules/authentication');
const disease = require('./modules/disease');
const symptom = require('./modules/symptom');
const practitioner = require('./modules/practitioner');
const patient = require('./modules/patient');
const admin = require('./modules/admin');
const appointment = require('./modules/appointment');
const payment = require('./modules/payment');
const TokenExpiredError = require("jsonwebtoken/lib/TokenExpiredError");

app.use(express.json());
app.use(session({
    cookie: {maxAge: 604800000, httpOnly: false},
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 604800000 // prune expired entries every 24h
    }),
    resave: true,
    secret: 'Shigeo Tokuda'
}))
app.use(express.static(path.join(__dirname, '../client/build')));
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
    app.use(function (req, res, next) {
        res.set({
            'content-type': 'application/json',
            'access-control-allow-headers': 'origin, x-requested-with, content-type, accept',
            'access-control-allow-origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true'
            // 'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
        });
        next();
    });
}
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/../client/public/404.html'));
    res.status(404);
    res.set({'content-type': 'text/html'});
});

// api
app.post("/user/register", auth.registerAccount);
app.post("/user/login", auth.loginAccount);
app.post("/user/logout", auth.logout);
app.post("/user/forgetPassword", auth.forgetPassword);
app.post("/user/resetPassword", auth.resetPassword);
app.post("/user/checkEmailExist", auth.checkEmailExist);
app.post("/user/isLogin", auth.isLogin);

app.use("/admin", (req, res, next) => {
    if (req.session.role !== 'admin') return res.status(401).json(null)
    next()
})

app.post("/admin/appointments/all", admin.listAllAppointments);
app.post("/admin/practitioners/all", admin.listAllPractitioners);
app.post("/admin/practitioners/create", admin.createPractitioner);
app.post("/admin/practitioners/delete", admin.deletePractitioner);
app.post("/admin/practitioners/account/create", admin.createPractitionerAccount);
app.post("/admin/practitioners/account/delete", admin.deletePractitionerAccount);
app.post("/admin/practitioners/delete", admin.deletePractitioner);
app.post("/admin/departments/all", admin.listAllDepartments);

app.post("/admin/patients/all", admin.listAllPatients);
app.post("/admin/patients/account/delete", admin.deletePatientAccount);
app.post("/admin/patients/delete", admin.deletePatient);

app.use("/patient/appointment/all", (req, res, next) => {
    if (!req.session.patientID && req.session.role !== 'patient') return res.status(401).json(null)
    next()
})
app.post("/patient/appointment/all", appointment.patientAppointments);
app.post("/patient/appointment/create", appointment.createAppointment);
app.post("/patient/appointment/getAvailableTime", appointment.getAvailableHours);
app.post("/patient/appointment/findRoom", appointment.findRoom);
app.post("/patient/appointment/last", appointment.findLastAppointment);
app.post("/patient/appointment/makePayment", payment.makePayment);
app.post("/patient/appointment/updatePayment", payment.updatePayment);
app.post("/patient/appointment/findPractitioner", practitioner.findPractitionerByDisease)


app.use("/practitioner/appointment/all", (req, res, next) => {
    if (!req.session.practitionerID && req.session.role !== 'practitioner') return res.status(401).json(null)
    next()
})
app.post("/practitioner/appointment/all", appointment.practitionerAppointments)


app.post("/symptom/all", symptom.queryAllSymptoms);

app.post("/disease/findDiseases", disease.findDiseasesBySymptoms);
app.post("/disease/all", disease.queryAllDiseases);



app.post("/patient/create", patient.createPatient)

app.post("/payment/invoice", payment.generateInvoice)
app.post("/verify-jwt", async (req, res) => {
    try {
        const decoded = await auth.verifyJWT(req.body["jwtToken"]);
        res.status(200).json(decoded.data);
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            res.status(401).json({"error": "Token Has Expired"});
        } else {
            res.status(500).json({"error": "Unspecified Server Error"});
        }
    }
});

module.exports = app;

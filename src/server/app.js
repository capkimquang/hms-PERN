const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const TokenExpiredError = require("jsonwebtoken/lib/TokenExpiredError");
if (process.env.NODE_ENV === 'development')
    dotenv.config({path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`)});
else
    dotenv.config();

const auth = require('./modules/authentication');
const disease = require('./modules/disease');
const symptom = require('./modules/symptom');
const medicalServices = require('./modules/medicalServices');
const practitioner = require('./modules/practitioner');
const patient = require('./modules/patient');
const department = require('./modules/department');
const appointment = require('./modules/appointment');
const payment = require('./modules/payment');


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
console.log(process.env.NODE_ENV);
console.log(process.env.DATABASE_URL);
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
app.post("/register", auth.registerAccount);
app.post("/login", auth.loginAccount);
app.post("/logout", auth.logout);
app.post("/forgetPassword", auth.forgetPassword);
app.post("/resetPassword", auth.resetPassword);
app.post("/checkEmailExist", auth.checkEmailExist);
app.post("/checkPhoneExist", auth.checkPhoneExist);
app.post("/isLogin", auth.isLogin);


// app.use("/user/", (req, res, next) => {
//     if (!req.session.userID) return res.status(401).json(null)
//     next()
// })
app.post("/user/changePassword", auth.changePassword);
app.post("/user/account/get", auth.getAccount);
app.post("/user/account/update", auth.updateAccount);

// app.use("/admin", (req, res, next) => {
//     if (req.session.role !== 'admin') return res.status(401).json(null)
//     next()
// })

app.post("/appointments/totalNumber", appointment.numberOfAppointments);
app.post("/admin/appointments/all", appointment.listAllAppointments);
app.post("/admin/appointments/byHour", appointment.nAppointmentsByHour);
app.post("/admin/appointments/recent", appointment.recentAppointments);
app.post("/admin/appointments/update", appointment.updateAppointment);
app.post("/admin/appointments/delete", appointment.deleteAppointment);

app.post("/admin/practitioners/all", practitioner.listAllPractitioners);
app.post("/admin/practitioners/create", practitioner.createPractitioner)
app.post("/admin/practitioners/find", practitioner.getPractitionerByID)
app.post("/admin/practitioners/update", practitioner.updatePractitioner);
app.post("/admin/practitioners/delete", practitioner.deletePractitionerAccount);
app.post("/admin/practitioners/account/create", practitioner.createPractitionerAccount);
app.post("/admin/practitioners/account/delete", practitioner.deletePractitionerAccount);
// app.post("/admin/practitioners/delete", admin.deletePractitioner);

app.post("/admin/departments/all", department.listAllDepartments);

app.post("/admin/patients/all", patient.listAllPatients);
app.post("/admin/patients/find", patient.getPatientByID);
app.post("/admin/patients/account/delete", patient.deletePatientAccount);
// app.post("/admin/patients/delete", admin.deletePatient);

// app.use("/patient/appointment/all", (req, res, next) => {
//     if (!req.session.patientID && req.session.role !== 'patient') return res.status(401).json(null)
//     next()
// })
app.post("/patient/appointments/all", appointment.patientAppointments);
app.post("/patient/appointments/create", appointment.createAppointment);
app.post("/patient/appointments/getAvailableTime", appointment.getAvailableHours);
app.post("/patient/appointments/hasAnotherAppointment", appointment.hasAnotherAppointment);
app.post("/patient/appointments/findRoom", appointment.findRoom);
app.post("/patient/appointments/last", appointment.findLastAppointment);
app.post("/patient/appointments/makePayment", payment.makePayment);
app.post("/patient/appointments/updatePayment", payment.updatePayment);
app.post("/patient/appointments/findPractitioner", practitioner.findPractitionerByMedicalService)


// app.use("/practitioner/appointment/all", (req, res, next) => {
//     if (!req.session.practitionerID && req.session.role !== 'practitioner') return res.status(401).json(null)
//     next()
// })
app.post("/practitioner/appointments/all", appointment.practitionerAppointments)
app.post("/practitioner/appointments/update", appointment.updateAppointmentPractitioner)


app.post("/symptom/all", symptom.queryAllSymptoms);
app.post("/medicalServices/all", medicalServices.listAllServices);
app.post("/medicalServices/general-checkup", medicalServices.getGeneralCheckup);

app.post("/disease/findDiseases", disease.findDiseasesBySymptoms);
app.post("/disease/all", disease.queryAllDiseases);

app.post("/patient/create", patient.createPatient)
app.post("/patient/update", patient.updatePatient)

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

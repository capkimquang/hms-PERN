import React                              from 'react';
import logo                               from './logo.svg';
import { BrowserRouter, Route, Switch }   from 'react-router-dom';

import Login                              from './containers/Authentication/Login';
import Register                           from './containers/Authentication/Register';
import Home                               from './containers/Authentication/Home';
import ForgetPassword                     from './containers/Authentication/ForgetPassword';
import ResetPassword                     from './containers/Authentication/ResetPassword';

import PatientDashboard                   from './containers/Dashboard/Patient/PatientDashboard';
import PractitionerDashboard              from './containers/Dashboard/Practitioner/PractitionerDashboard';
import AdminDashboard                     from './containers/Dashboard/Admin/AdminDashboard';

import './App.css';
import AppointmentTable from "./containers/Table/Admin/AppointmentTable";
import PractitionerTable from "./containers/Table/Admin/PractitionerTable";
import PatientTable from "./containers/Table/Admin/PatientTable";
import Paper from "@material-ui/core/Paper";


function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path = "/login"                          component = { Login }/>
        <Route path = "/register"                       component = { Register } />
        <Route path = "/forgetPassword"                 component = { ForgetPassword } />
        <Route path = "/patient"                        component = { PatientDashboard } />
        <Route path = "/practitioner"                   component = { PractitionerDashboard } />
        <Route path = "/admin"                          component = { AdminDashboard } />
        <Route path = "/resetPassword"                  component = { ResetPassword } />

        <Route path = "/"                               component = { Home } />


      </Switch>
    </BrowserRouter>
  );
}

export default App;

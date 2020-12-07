import React, {Component} from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import LoadingDialog from "../../Dialog/OtherDialog/LoadingDialog";
import EditPractitionerDialog from "../../Dialog/EditDialog/EditPractitionerDialog";
import NewPractitionerDialog from "../../Dialog/NewDialog/NewPractitionerDialog";
import ErrorDialog from "../../Dialog/OtherDialog/ErrorDialog";
import {allAppointment} from "../../../components/API/AllAppointment";
import {allPractitioner} from "../../../components/API/AllPractitioner";
import {allPatient} from "../../../components/API/AllPatient";
import EditPatientDialog from "../../Dialog/EditDialog/EditPatientDialog";
import {Redirect} from "react-router-dom";

let columns = [
    {id: 'name', label: 'Name'},
    {id: 'gender', label: 'Sex', align: 'right'},
    {id: 'email', label: 'Email', align: 'right'},
    {id: 'phone', label: 'Phone', align: 'right'},
    {id: 'dob', label: 'Date of Birth', align: 'right'}
];
let patient = {
    name: '',
    sex: '',
    email: '',
    phone: '',
    dob: ''
};

class PractitionerTable extends Component {
    state = {
        patient: [],
        loading: false,
        editPatientDialog: false,
        newPractitionerDialog: false,
        errorDialog: false
    };

    componentDidMount() {
        this.getAllPatient().then();
    }

    getAllPatient = async () => {
        await allPatient().then(data => {
            this.setState({
                patient: data
            });
        });
        console.log(this.state.patient);
    }

    handleDialogClose = async (close, type) => {
        if (type === "editPatient") {
            await this.setState({
                editPatientDialog: close
            });
        } else if (type === "newPractitioner") {
            await this.setState({
                newPractitionerDialog: close
            });
        } else if (type === 'error') {
            await this.setState({
                errorDialog: close
            });
        }
    };
    handleLoading = async (loading) => {
        await this.setState({
            loading: loading
        })
    };
    handleRowClick = (event, row) => {
        patient = {
            name: row.name,
            sex: row.gender,
            email: row.email,
            phone: row.phone,
            dob: row.dob
        }
        this.setState({editPatientDialog: true});
    };

    /*
    * Click New -> Yes/No Dialog
    *             -> Yes: symptomsKnown = true
    *               -> New Appointment Dialog
    *             -> No:  symptomsKnown = false
    *               -> Symptoms Dialog -> Click Save -> Return Predicted Disease
    *                 -> New Appointment Dialog
    */
    handleNewClick = async () => {
        await this.setState({
            newPractitionerDialog: true
        });
    };

    getError = async (error) => {
        await this.setState({
            errorDialog: error.error,
            errorMessage: error.message
        })
    }

    render() {
        return (
            <React.Fragment>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>Patients</Typography>
                <TableContainer>
                    <Table size="medium" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key = { column.id } align = { column.align }>
                                        { column.label }
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { this.state.patient.map((row) => {
                                return (
                                    <TableRow hover key = { row.id } onClick = {(event) => this.handleRowClick(event, row)}>
                                        { columns.map((column) => {
                                            return (
                                                <TableCell key = { column.id } align = { column.align }>
                                                    { row[column.id] }
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <EditPatientDialog open={this.state.editPatientDialog}
                                        close={this.handleDialogClose}
                                        loading={this.handleLoading}
                                        {...patient}/>
                <ErrorDialog open={this.state.errorDialog}
                             close={this.handleDialogClose}
                             error={this.state.errorMessage}/>
                <LoadingDialog open={this.state.loading}/>
            </React.Fragment>
        );
    }
}

export default PractitionerTable;
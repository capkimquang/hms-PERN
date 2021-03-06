import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from "@material-ui/core/Grid";

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import IconButton from "@material-ui/core/IconButton";
import PractitionerInfoDialog from "../InfoDialog/PractitionerInfoDialog";
import {deleteAppointment} from "../../../components/API/DeleteAppointment";
import {availableTimeByPractitioner} from "../../../components/API/AvailableTimeByPractitioner";
import LoadingDialog from "../OtherDialog/LoadingDialog";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {editAppointment} from "../../../components/API/EditAppointment";
import {allMedicalService} from "../../../components/API/AllMedicalService";
import {practitionerByMedicalService} from "../../../components/API/PractitionerByMedicalService";
import {checkinAppointment} from "../../../components/API/CheckinAppointment";
import {roomByMedicalService} from "../../../components/API/RoomByMedicalService";
import {capitalFirstChar} from "../../../components/Services/CapitalFirstChar";
import {checkAppointmentExist} from "../../../components/API/CheckAppointmentExist";
import ErrorDialog from "../OtherDialog/ErrorDialog";
import {authorizedUser} from "../../../components/API/Authenticated";

class EditAppointmentDialog extends Component {
    state = {
        medicalServiceList: [this.props.appointment.medicalService],
        medicalServiceID: this.props.appointment.medicalService.id,
        practitionerList: [this.props.appointment.practitioner],
        practitionerID: this.props.appointment.practitioner.id,
        date: new Date(this.props.appointment.date[2],
            this.props.appointment.date[1] - 1,
            this.props.appointment.date[0], 0, 0, 0),
        timeList: [this.props.appointment.time],
        time: this.props.appointment.time,
        log: this.props.appointment.log,
        room: this.props.appointment.room,
        prescription: this.props.appointment.prescription,
        nextAppointment: {
            period: this.props.appointment.next_appointment_period,
            service: this.props.appointment.next_appointment_service,
            serviceID: this.props.appointment.next_appointment_service_id,
        },
        diseaseInfoDialog: false,
        userInfoDialog: false,
        userInfo: null,
        loading: false,
        error: {
            errorDialog: false,
            errorMessage: null
        }
    }

    async componentDidMount() {
        try {
            await this.setState({ loading: true });
            const time = await availableTimeByPractitioner(this.state.practitionerID, this.state.date);
            const practitioner = await practitionerByMedicalService(this.state.medicalServiceID);
            await this.setState({
                timeList: time.concat(this.state.time).sort(),
                practitionerList: practitioner.concat(this.state.practitionerList),
                medicalServiceList: await allMedicalService(),
            });
            console.log(this.state.medicalServiceList);
        } finally {
            await this.setState({loading: false});
        }
    }

    handleDialogClose = async () => {
        await this.setState({
            medicalServiceID: this.props.appointment.medical_serviceID,
            practitionerList: [],
            practitioner: null,
        })
        // send close state back to parent: AppointmentTable
        this.props.close(false, "editAppointment");
    }
    handleSubDialogClose = async (close, type) => {
        if (type === "diseaseInfo") {
            await this.setState({
                diseaseInfoDialog: close
            });
        } else if (type === "userInfo") {
            await this.setState({
                userInfoDialog: close
            });
        } else if (type === 'error') {
            await this.setState({
                error: {
                    open: close,
                    message: null
                }
            });
        }
    }
    handleSave = async () => {
        await this.setState({ loading: true });
        const user = await authorizedUser();
        let hasAnotherAppointment;
        try {
            await this.setState({ loading: true });
            hasAnotherAppointment = await checkAppointmentExist(this.props.appointment.patient.id || user.patientID, this.state.date, this.state.time);
        } finally {
            await this.setState({ loading: false });
        }
        if (hasAnotherAppointment) {
            await this.setState({
                error: {
                    errorDialog: true,
                    errorMessage: 'Another appointment is booked in this period.'
                }
            });
        } else {
            await editAppointment(this.props.appointment.id, this.state.date, this.state.time);
            await this.setState({
                date: new Date(this.props.appointment.date[2],
                    this.props.appointment.date[1] - 1,
                    this.props.appointment.date[0], 0, 0, 0),
                timeList: [this.props.appointment.time],
                time: this.props.appointment.time,
                diseaseInfoDialog: false,
                practitionerInfoDialog: false,
                loading: false
            })
            await this.handleDialogClose();
        }
    };
    handleDelete = async () => {
        await deleteAppointment(this.props.appointment.id);
        await this.handleDialogClose();
    };
    handleCheckin = async () => {
        let appointment = {
            id: this.props.appointment.id,
            log: this.state.log,
            prescription: this.state.prescription,
            nextAppointmentPeriod: this.state.nextAppointment.period,
            nextAppointmentServiceID: this.state.nextAppointment.serviceID,
        }
        await checkinAppointment(appointment);
        await this.handleDialogClose();
    };

    handleMedicalServiceChange = async (event) => {
        await this.setState({
            medicalServiceID: event.target.value
        });
        try {
            await this.setState({ loading: true });
            await this.setState({
                practitionerList: await practitionerByMedicalService(this.state.medicalServiceID),
                room: await roomByMedicalService(this.state.medicalServiceID)
            });
            console.log(this.state.practitionerList)
        } finally {
            await this.setState({ loading: false });
        }
    }
    handlePractitionerChange = async (event) => {
        await this.setState({
            practitionerID: event.target.value,
        });
    }
    handleDateChange = async (date) => {
        if (this.daysFromToday(date) < 3) {
            alert('The chosen day is too close to today (< 3 days)')
        } else {
            await this.setState({
                date: date
            });
            try {
                await this.setState({loading: true});
                const res = await availableTimeByPractitioner(this.state.practitionerID, this.state.date);
                await this.setState({
                    timeList: res
                });
            } finally {
                await this.setState({loading: false});
            }
        }
    }
    handleTimeChange = async (event) => {
        await this.setState({
            time: event.target.value
        })
    }
    handleLogChange = async (event) => {
        await this.setState({
            log: event.target.value
        });
    }
    handlePrescriptionChange = async (event) => {
        await this.setState({
            prescription: event.target.value
        });
    }
    handleNextAppointmentPeriodChange = async (event) => {
        await this.setState({
            nextAppointment: {
                period: event.target.value,
                serviceID: this.state.nextAppointment.serviceID
            }
        });
    }
    handleNextAppointmentServiceChange = async (event) => {
        await this.setState({
            nextAppointment: {
                period: this.state.nextAppointment.period,
                serviceID: event.target.value
            }
        });
    }
    handleUserInfoClick = async (user) => {
        await this.setState({
            userInfoDialog: true,
            userInfo: user
        });
    }

    daysFromToday(date) {
        const secondDiff = date.getTime() - (new Date()).getTime();
        return secondDiff / (1000 * 60 * 60 * 24);
    }

    render() {
        return (
            <React.Fragment>
                <Dialog
                    open={this.props.open}
                    onClose={this.handleDialogClose}
                    aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Appointment Information</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            {/* Dialog Content */}
                            <Grid item xs={12}>
                                <DialogContentText id="alert-dialog-description">
                                    To edit information of this appointment, please enter or choose new information
                                    below.
                                    There are some read only information you can not change.
                                </DialogContentText>
                            </Grid>
                            {/* Medical Service */}
                            { (this.props.user === 'admin') ?
                                    <Grid item xs={6}>
                                        <TextField
                                            autoFocus fullWidth select
                                            variant="outlined"
                                            id="medical_service"
                                            label="Medical Service"
                                            value={this.state.medicalServiceID}
                                            InputProps={{readOnly: this.daysFromToday(this.state.date) < 3}}
                                            onChange={this.handleMedicalServiceChange}>{
                                            this.state.medicalServiceList.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.name.charAt(0).toUpperCase() + option.name.slice(1)} - {option.price}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    : <Grid item xs={6}>
                                        <TextField
                                            autoFocus fullWidth
                                            variant="outlined"
                                            id="medical_service"
                                            label="Medical Service"
                                            value = { `${capitalFirstChar(this.props.appointment.medicalService.name)} - ${this.props.appointment.medicalService.price}` }
                                            InputProps={{ readOnly: true }}>

                                        </TextField>
                                    </Grid>
                            }
                            {/* Room */}
                            <Grid item xs={6}>
                                <TextField
                                    autoFocus fullWidth
                                    variant="outlined"
                                    id="room"
                                    label="Room"
                                    value={this.state.room}
                                    InputProps={{ readOnly: true }}/>
                            </Grid>
                            {/* Practitioner */}
                            { (this.props.user !== 'practitioner') && (
                                (this.props.user === 'admin') ?
                                    <Grid item xs = {6}>
                                        <TextField
                                            autoFocus fullWidth select
                                            variant       = "outlined"
                                            id            = "practitioner"
                                            label         = "Practitioner"
                                            value         = { this.state.practitionerID }
                                            InputProps={{readOnly: this.daysFromToday(this.state.date) < 3}}
                                            onChange      = { this.handlePractitionerChange }>{
                                            this.state.practitionerList.map((option) => (
                                                <MenuItem key = { option.id } value = { option.id }>
                                                    { option.name }
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid> : <Grid item xs={12}>
                                        <TextField
                                            autoFocus fullWidth
                                            variant="outlined"
                                            id="practitioner"
                                            label="Practitioner"
                                            value={this.props.appointment.practitioner.name}
                                            InputProps={{
                                                readOnly: true,
                                                endAdornment:
                                                    <IconButton aria-label="information">
                                                        <InfoOutlinedIcon
                                                            onClick={() => this.handleUserInfoClick('practitioner')}/>
                                                    </IconButton>
                                            }}
                                        />
                                    </Grid>
                            )}
                            {/* Patient */}
                            { (this.props.user !== 'patient') &&
                                <Grid item xs={this.props.user === 'admin' ? 6 : 12}>
                                    <TextField
                                        autoFocus fullWidth
                                        variant="outlined"
                                        id="patient"
                                        label="Patient"
                                        value={this.props.appointment.patient.name}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment:
                                                <IconButton aria-label="information">
                                                    <InfoOutlinedIcon
                                                        onClick={() => this.handleUserInfoClick('patient')}/>
                                                </IconButton>
                                        }}
                                    />
                                </Grid>
                            }
                            {/* Date */}
                            <Grid item xs={6}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        fullWidth autoFocus
                                        disablePast = { this.props.appointment.status !== 'done' }
                                        readOnly    = { this.props.appointment.status === 'done' || this.daysFromToday(this.state.date) < 3}
                                        error       = { this.props.appointment.status === 'done' && false }
                                        helperText  = { null }
                                        variant="dialog"
                                        inputVariant="outlined"
                                        label="Date of appointment"
                                        format="dd/MM/yyyy"
                                        value={this.state.date}
                                        onChange={this.handleDateChange}/>
                                </MuiPickersUtilsProvider>
                            </Grid>
                            {/* Time */}
                            <Grid item xs={6}>{
                                (this.props.appointment.status === 'done') ?
                                    <TextField
                                        autoFocus fullWidth
                                        variant="outlined"
                                        id="time"
                                        label="Time"
                                        value={this.state.time}
                                        InputProps={{readOnly: this.daysFromToday(this.state.date) < 3}}
                                        onChange={this.handleTimeChange} /> :
                                    <TextField
                                        autoFocus fullWidth select
                                        variant="outlined"
                                        InputProps={{readOnly: this.daysFromToday(this.state.date) < 3}}
                                        id="time"
                                        label="Time"
                                        value={this.state.time}
                                        onChange={this.handleTimeChange}>{
                                        this.state.timeList.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                            } </Grid>
                            { (this.props.appointment.status === 'done' || this.props.user === 'practitioner') &&
                                <React.Fragment>
                                    {/* Notes and Prescription */}
                                    <Grid item xs={12}>
                                        <DialogContentText id="alert-dialog-description">
                                            Appointment note and prescription from practitioner
                                        </DialogContentText>
                                    </Grid>
                                    {/* Notes */}
                                    <Grid item xs={12}>
                                        <TextField
                                            autoFocus fullWidth multiline
                                            rowsMax = {4}
                                            variant="outlined"
                                            id="log"
                                            label="Log"
                                            value={this.state.log}
                                            InputProps={{readOnly: this.props.appointment.status === 'done'}}
                                            onChange = { this.handleLogChange }/>
                                    </Grid>
                                    {/* Prescription */}
                                    <Grid item xs={12}>
                                        <TextField
                                            autoFocus fullWidth multiline
                                            rowsMax = {4}
                                            variant="outlined"
                                            id="prescription"
                                            label="Prescription"
                                            value={this.state.prescription}
                                            InputProps={{readOnly: this.props.appointment.status === 'done'}}
                                            onChange = { this.handlePrescriptionChange }/>
                                    </Grid>
                                    {/* Next appointment */}
                                    <Grid item xs={12}>
                                        <DialogContentText id="alert-dialog-description">
                                            Next appointment information
                                        </DialogContentText>
                                    </Grid>
                                    {/* Period */}
                                    <Grid item xs={3}>
                                        <TextField
                                            autoFocus fullWidth
                                            variant="outlined"
                                            id="next_appointment_period"
                                            label="Period"
                                            value={this.state.nextAppointment.period}
                                            InputProps={{readOnly: this.props.appointment.status === 'done'}}
                                            onChange = { this.handleNextAppointmentPeriodChange }/>
                                    </Grid>
                                    {/* Service */}
                                    <Grid item xs={9}>
                                        {
                                            (this.props.appointment.status === 'done') ?
                                                <TextField
                                                    autoFocus fullWidth
                                                    variant="outlined"
                                                    id="medical_service"
                                                    label="Medical Service"
                                                    value={ `${capitalFirstChar(this.props.appointment.medicalService.name)} - ${this.props.appointment.medicalService.price}` }
                                                    InputProps={{ readOnly: true }}/> :
                                                <TextField
                                                    autoFocus fullWidth select
                                                    variant="outlined"
                                                    id="next_appointment_service"
                                                    label="Service"
                                                    value={this.state.nextAppointment.serviceID}
                                                    onChange = { this.handleNextAppointmentServiceChange }>{
                                                    this.state.medicalServiceList.map((option) => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {capitalFirstChar(option.name)} - {option.price}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                        }
                                    </Grid>
                                </React.Fragment>
                            }
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        {
                            (this.props.appointment.status === 'done') ?
                                <Button onClick={this.handleDialogClose} color="primary" align="right">
                                    Got It!
                                </Button>
                                : <React.Fragment>
                                    <Button onClick={this.handleDelete} color="primary" align="left">
                                        Delete
                                    </Button>
                                    {
                                        (this.props.user === 'practitioner') &&
                                        <Button onClick={this.handleCheckin} color="primary" align="right">
                                            Release
                                        </Button>
                                    }
                                    <Button onClick={this.handleSave} color="primary" align="right">
                                        Save
                                    </Button>
                                </React.Fragment>
                        }
                    </DialogActions>
                </Dialog>
                <PractitionerInfoDialog open={this.state.userInfoDialog}
                                        close={this.handleSubDialogClose}
                                        data={(this.state.userInfo === 'patient') ? this.props.appointment.patient : this.props.appointment.practitioner}
                                        user={this.state.userInfo}/>
                <ErrorDialog open = { this.state.error.errorDialog }
                             close = { this.handleSubDialogClose }
                             error = { this.state.error.errorMessage } />
                <LoadingDialog open={this.state.loading}/>
            </React.Fragment>

        );
    }
}

export default EditAppointmentDialog;

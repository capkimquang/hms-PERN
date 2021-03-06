import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {authorizedUser} from "../../components/API/Authenticated";
import AuthContainer from "../../containers/Authentication/AuthContainer";
import DrawerAppBar from "../../containers/Others/DrawerAppBar";
import Dashboard from "../../containers/Dashboard/Dashboard";
import AppointmentTable from "../../containers/Table/AppointmentTable";
import PractitionerTable from "../../containers/Table/PractitionerTable";
import PatientTable from "../../containers/Table/PatientTable";


const style = (theme) => ({
    root: {
        display: 'flex'
    },
    content: {
        flexGrow: 1,
        overflow: 'auto'
    },
    appBarSpacer: theme.mixins.toolbar,
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4)
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        height: 640
    }
});

class UserDashboard extends Component {
    state = {
        user: null,
    };
    async isAdmin() {
        const user = await authorizedUser();
        if (user && user.role === 'admin') {
            await this.setState({ user: user.role });
            return Promise.resolve();
        }
        return Promise.reject();
    }
    async isPatient() {
        const user = await authorizedUser();
        if (user && user.role === 'patient') {
            await this.setState({ user: user.role });
            return Promise.resolve();
        }
        return Promise.reject();
    }
    async isPractitioner() {
        const user = await authorizedUser();
        console.log(user);
        if (user && user.role === 'practitioner') {
            await this.setState({ user: user.role });
            return Promise.resolve();
        }
        return Promise.reject();
    }
    render() {
        const {classes} = this.props;
        return (
            (this.state.user !== 'admin') ? (this.state.user !== 'practitioner') ?
                <AuthContainer authorize={this.isPatient}>
                            <div className={classes.root}>
                                <CssBaseline/>
                                <DrawerAppBar type="patient"/>
                                <div className={classes.content}>
                                    <div className={classes.appBarSpacer}/>
                                    <Container maxWidth="lg" className={classes.container}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Paper className={classes.paper}>
                                                    <Route exact path="/patient" exact component={Dashboard}/>
                                                    <Route exact path="/patient/dashboard" exact component={Dashboard}/>
                                                    <Route path="/patient/appointment" exact component={AppointmentTable}/>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Container>
                                </div>
                            </div>
                        </AuthContainer>
                : <AuthContainer authorize = { this.isPractitioner }>
                            <div className={classes.root}>
                                <CssBaseline/>
                                <DrawerAppBar type="practitioner"/>
                                <div className={classes.content}>
                                    <div className={classes.appBarSpacer}/>
                                    <Container maxWidth="lg" className={classes.container}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Paper className={classes.paper}>
                                                    <Route exact path="/practitioner" component = { Dashboard } />
                                                    <Route exact path="/practitioner/dashboard" component = { Dashboard } />
                                                    <Route exact path="/practitioner/appointment" component = { AppointmentTable }/>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Container>
                                </div>
                            </div>
                        </AuthContainer>
                : <AuthContainer authorize={this.isAdmin}>
                            <div className={classes.root}>
                                <CssBaseline/>
                                <DrawerAppBar type="admin"/>
                                <div className={classes.content}>
                                    <div className={classes.appBarSpacer}/>
                                    <Container maxWidth="lg" className={classes.container}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Paper className={classes.paper}>
                                                    <Route path="/admin" exact component={Dashboard}/>
                                                    <Route path="/admin/dashboard" exact component={Dashboard}/>
                                                    <Route path="/admin/appointment" exact component={AppointmentTable}/>
                                                    <Route path="/admin/practitioner" exact component={PractitionerTable}/>
                                                    <Route path="/admin/patient" exact component={PatientTable}/>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Container>
                                </div>
                            </div>
                        </AuthContainer>
        );
    }
}

export default withStyles(style, {withTheme: true})(UserDashboard);

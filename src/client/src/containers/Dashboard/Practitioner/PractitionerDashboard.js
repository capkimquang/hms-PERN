import React, { Component }                     from 'react';
import { Route }         from 'react-router-dom';

import { withStyles }                           from '@material-ui/core/styles';
import CssBaseline                              from '@material-ui/core/CssBaseline';
import Container                                from '@material-ui/core/Container';
import Grid                                     from '@material-ui/core/Grid';
import Paper                                    from '@material-ui/core/Paper';

import AppointmentTable from '../../Table/Admin/AppointmentTable';
import DrawerAppBar from '../../Others/DrawerAppBar';
import Dashboard from "../../../components/Others/Dashboard";

const style = (theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    height: '100vh',
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

class PractitionerDashboard extends Component {
  render() {
    const { classes } = this.props;

    return (
        <div className = { classes.root }>
          <CssBaseline />
          <DrawerAppBar type = "patient"/>
          <main className = { classes.content }>
            <div className = { classes.appBarSpacer } />
            <Container maxWidth = "lg" className = { classes.container }>
              <Grid container spacing = {3}>
                <Grid item xs = {12}>
                  <Paper className = { classes.paper }>
                    <Route exact path = "/practitioner"
                           render = { (props) => <Dashboard {...props} for = {"practitioner"} /> } />
                    <Route exact path = "/practitioner/dashboard"
                           render = { (props) => <Dashboard {...props} for = {"practitioner"} /> } />
                    <Route path = "/practitioner/appointment" exact component = { AppointmentTable } />
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </main>
        </div>
    );
  }
}

export default withStyles(style, { withTheme: true })(PractitionerDashboard);

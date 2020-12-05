import React, {Component} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Link as RouteLink} from 'react-router-dom';

// Service -------------------------------
import {validate} from '../../components/Services/Validate';
import {$} from '../../helper';
import LoadingDialog from "../Dialog/OtherDialog/LoadingDialog";

// API
import {resetPassword} from "../../components/API/passwordRecovery";

/*
can't use hooks because this is a component.
so we can't useStyles API from Material UI
use withStyles instead.
*/
const style = theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    }
});

class ResetPassword extends Component {
    state = {
        password: {
            value: '',
            hasError: false,
            error: ''
        },
        button: {
            open: false,
            error: ''
        },
        done: false,
        loading: false
    };

    handleEmailInput = (event) => {
        const match = validate("email", this.state.password.value);

        this.setState({
            password: {
                value: event ? event.target.value : this.state.password.value,
                hasError: !match.email,
                error: !match.email ? 'Invalid email address' : ''
            }
        });
    };

    handleDialogClose = () => {
        this.setState({
            button: {
                open: false,
                error: ''
            }
        })
    }

    handleSubmit = async () => {
        const dialogStatus = {
            dialogMessage: '',
            dialogHasError: false
        };

        if (this.state.password.hasError) {
            dialogStatus.dialogHasError = true;
            dialogStatus.dialogMessage = 'The given email is invalid. Please input the valid email';
        }

        this.setState({
            button: {
                open: dialogStatus.dialogHasError,
                error: dialogStatus.dialogMessage
            }
        });

        if (!dialogStatus.dialogHasError) {
            this.setState({done: true});
            try {
                const urlParams = new URLSearchParams(window.location.search);
                let token;
                if (urlParams.has("token")) {
                    token = urlParams.get("token");
                    console.log(token);
                }
                // await resetPassword(this.state.password.value, token);
                await this.setState({loading: true});
            } catch (e) {
                console.log(e);
            } finally {
                await this.setState({loading: false});
            }
        }
    };

    backToForm = (event) => {
        event.preventDefault();
        this.setState({done: false});
    }

    render() {
        const {classes} = this.props;

        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5" gutterBottom>
                        Password Recovery
                    </Typography>
                    {
                        this.state.done
                            ?
                            <Typography component="p" variant="body1" align="justify">
                                You should soonly receive an email containing a link to reset password.
                                If you have not received an email, it may not be a registered one. Click <span> </span>
                                <Link href="" onClick={this.backToForm}>
                                    here
                                </Link>
                                <span> </span> to enter another one.
                            </Typography>
                            :
                            <div>
                                <Typography component="p" variant="subtitle2">
                                    Enter your email address to receive reset password link
                                </Typography>
                                <form className={classes.form} onSubmit={this.handleSubmit}>
                                    <Grid container spacing={2}>
                                        {/* Email Input */}
                                        <Grid item xs={12}>
                                            <TextField
                                                variant="outlined"
                                                required
                                                fullWidth
                                                id="email"
                                                label="Email Address"
                                                name="email"
                                                autoComplete="email"
                                                value={this.state.password.value}
                                                error={this.state.password.hasError}
                                                helperText={this.state.password.error}
                                                onChange={this.handleEmailInput}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Button
                                        className={classes.submit}
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                    <Dialog
                                        open={this.state.button.open}
                                        onClose={this.handleDialogClose}
                                        aria-describedby="alert-dialog-description"
                                    >
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description">
                                                {this.state.button.error}
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={this.handleDialogClose} color="primary">
                                                Got it!
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </form>
                            </div>

                    }

                </div>
                <LoadingDialog open={this.state.loading}/>
            </Container>
        );
    };
}

export default withStyles(style, {withTheme: true})(ResetPassword);
import React, {Component} from 'react';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

class YesNoDialog extends Component {
    handleDialogClose = () => {
        // send close state back to parent: AppointmentTable
        this.props.close(false, "yesNo");
    }

    handleYes = () => {
        // send close state back to parent: AppointmentTable
        this.props.yesno(true);
        this.handleDialogClose()
    };
    handleNo = () => {
        // send close state back to parent: AppointmentTable
        this.props.yesno(false);
        this.handleDialogClose();
    };

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleDialogClose}
                aria-labelledby="form-dialog-title">
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {this.props.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleYes} color="primary" align="right">
                        Yes
                    </Button>
                    <Button onClick={this.handleNo} color="primary" align="right">
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default YesNoDialog;

import React, {Component} from 'react';
import Typography from "@material-ui/core/Typography";

class Appointment extends Component {
    render() {
        return (
            <React.Fragment>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Appointments
                </Typography>
                <Typography component="p" variant="h3">
                    1285
                </Typography>
                <Typography color="textSecondary">
                    was made.
                </Typography>
            </React.Fragment>
        );
    }
}

export default Appointment;
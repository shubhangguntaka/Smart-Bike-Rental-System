import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from "@mui/material";

interface Props {

    open: boolean;

    onClose: () => void;

    onConfirm: () => void;

}

const CancelBookingDialog = ({
    open,
    onClose,
    onConfirm
}: Props) => {

    return (

        <Dialog
            open={open}
            onClose={onClose}
        >

            <DialogTitle>

                Cancel Booking

            </DialogTitle>

            <DialogContent>

                <Typography>

                    Are you sure you want to cancel this booking?

                </Typography>

            </DialogContent>

            <DialogActions>

                <Button
                    onClick={onClose}
                >

                    No

                </Button>

                <Button

                    color="error"

                    variant="contained"

                    onClick={onConfirm}

                >

                    Yes

                </Button>

            </DialogActions>

        </Dialog>

    );

};

export default CancelBookingDialog;
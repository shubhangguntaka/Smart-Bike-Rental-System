import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Snackbar,
    Typography,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptIcon from "@mui/icons-material/Receipt";

import BookingQRCode from "../../components/booking/BookingQRCode";
import BookingReceipt from "../../components/booking/BookingReceipt";
import type { Booking } from "../../types/booking";
import { BookingService } from "../../services/bookingService";
import useAuth from "../../hooks/useAuth";

const BookingDetails = () => {
    const { user } = useAuth();

    const { id } = useParams();

    const navigate = useNavigate();

    const [booking, setBooking] =
        useState<Booking>();

    const [loading, setLoading] =
        useState(true);

    const [success, setSuccess] =
        useState(false);

    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {

        if (id) {

            loadBooking(Number(id));

        }

    }, [id]);

    async function loadBooking(
        bookingId: number
    ) {

        try {

            setLoading(true);

            const data =
                await BookingService.getBookingById(
                    bookingId
                );

            setBooking(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    const cancelBooking = async () => {

        if (!booking) return;

        try {

            await BookingService.cancelBooking(
                booking.bookingId
            );

            setSuccess(true);

            loadBooking(
                booking.bookingId
            );

        } catch (error) {

            console.error(error);

        }

    };

    const getStatusColor = (
        status: string
    ) => {

        switch (status) {

            case "CONFIRMED":
                return "success";

            case "PENDING":
                return "warning";

            case "COMPLETED":
                return "info";

            case "CANCELLED":
                return "error";

            default:
                return "default";
        }

    };

    const formatDateTime = (dateStr: string) => {
        try {
            if (!dateStr) return "N/A";
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const day = date.getDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedHours = String(hours).padStart(2, "0");
            return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
        } catch {
            return dateStr;
        }
    };

    if (loading) {

        return (

            <Box
                display="flex"
                justifyContent="center"
                mt={8}
            >
                <CircularProgress />
            </Box>

        );

    }

    if (!booking) {

        return (

            <Container>

                <Typography>

                    Booking not found.

                </Typography>

            </Container>

        );

    }

    return (

        <Container maxWidth="lg">

            <Box mt={4}>

                <Button

                    startIcon={<ArrowBackIcon />}

                    onClick={() =>
                        navigate(-1)
                    }

                >

                    Back

                </Button>

                <Typography
                    variant="h4"
                    mt={2}
                    mb={3}
                >

                    Booking Details

                </Typography>

                <Grid
                    container
                    spacing={3}
                >

                    <Grid
                        item
                        xs={12}
                        md={8}
                    >

                        <Card>

                            <CardContent>

                                <Typography
                                    variant="h5"
                                    gutterBottom
                                >

                                    Booking Reference

                                </Typography>

                                <Typography>

                                    {booking.bookingReference}

                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Typography>

                                    Bike: <strong>{booking.bikeName || `ID: #${booking.bikeId}`}</strong>

                                </Typography>

                                <Typography>

                                    Customer ID :
                                    {booking.customerId}

                                </Typography>

                                <Typography>

                                    Start Time: {formatDateTime(booking.startTime)}

                                </Typography>

                                <Typography>

                                    Return Time: {formatDateTime(booking.returnTime)}

                                </Typography>

                                <Typography>

                                    Total Days :
                                    {booking.totalDays}

                                </Typography>

                                <Typography>

                                    Amount :
                                    ₹ {booking.totalAmount}

                                </Typography>

                                <Typography>

                                    Payment :
                                    {booking.paymentStatus}

                                </Typography>

                                <Box mt={3} display="flex" gap={2} alignItems="center">

                                    <Chip

                                        label={
                                            booking.bookingStatus
                                        }

                                        color={
                                            getStatusColor(
                                                booking.bookingStatus
                                            ) as any
                                        }

                                    />

                                </Box>

                                <Box mt={3} display="flex" gap={2}>
                                    {(booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "COMPLETED" || booking.bookingStatus === "ACTIVE") && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<ReceiptIcon />}
                                            onClick={() => setShowReceipt(true)}
                                        >
                                            View Receipt
                                        </Button>
                                    )}

                                    {booking.bookingStatus !== "CANCELLED" && booking.bookingStatus !== "COMPLETED" && booking.bookingStatus !== "ACTIVE" && (
                                        <Button
                                            color="error"
                                            variant="contained"
                                            startIcon={<CancelIcon />}
                                            onClick={cancelBooking}
                                        >
                                            Cancel Booking
                                        </Button>
                                    )}
                                </Box>

                            </CardContent>

                        </Card>

                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <BookingQRCode
                            value={
                                booking.qrCode || booking.bookingReference
                            }
                            bookingId={booking.bookingId}
                            bookingStatus={booking.bookingStatus}
                        />

                    </Grid>

                </Grid>

            </Box>

            <Snackbar

                open={success}

                autoHideDuration={3000}

            >

                <Alert severity="success">

                    Booking cancelled successfully.

                </Alert>

            </Snackbar>

            <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Rental Invoice & Receipt
                    <IconButton onClick={() => setShowReceipt(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <BookingReceipt
                        bookingId={booking.bookingId}
                        customerName={user?.fullName || "Valued Customer"}
                        bikeName={booking.bikeName || `Bike #${booking.bikeId}`}
                        pickupDate={booking.startTime}
                        returnDate={booking.returnTime}
                        rentalAmount={booking.rentalAmount || booking.totalAmount}
                        paymentStatus={booking.paymentStatus}
                        bookingStatus={booking.bookingStatus}
                        qrCodeValue={booking.qrCode || booking.bookingReference}
                    />
                </DialogContent>
            </Dialog>

        </Container>

    );

};

export default BookingDetails;

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Snackbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

import BookingForm from "../../components/booking/BookingForm";
import type { BookingRequest } from "../../types/booking";
import { BookingService } from "../../services/bookingService";

const CreateBooking = () => {

  const { bikeId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState(false);

  const handleBooking = async (
    booking: BookingRequest
  ) => {

    try {

      setLoading(true);

      const customerId = user?.id || 1;

      // 0. Check bike availability for selected time
      const isAvailable = await BookingService.checkAvailability(
        booking.bikeId,
        booking.startTime,
        booking.returnTime
      );

      if (!isAvailable) {
        setIsUnavailableDialogOpen(true);
        setLoading(false);
        return;
      }

      const bookingData = await BookingService.createBooking(
        customerId,
        booking
      );

      setSuccess(true);

      setTimeout(() => {

        navigate(`/customer/payment/${bookingData.bookingId}`);

      }, 1500);

    } catch (err: any) {

      console.error(err);

      setError(err.response?.data?.message || err.message || "Failed to create booking");

    } finally {

      setLoading(false);

    }

  };

  if (!bikeId) {

    return (

      <Container>

        <Typography>

          Bike not found.

        </Typography>

      </Container>

    );

  }

  return (

    <Container maxWidth="sm">

      <Box mt={5}>

        <Typography

          variant="h4"

          mb={3}

        >

          Book Bike

        </Typography>

        {loading && (

          <Box

            display="flex"

            justifyContent="center"

            mb={3}

          >

            <CircularProgress />

          </Box>

        )}

        <BookingForm

          bikeId={Number(bikeId)}

          onSubmit={handleBooking}

          loading={loading}

        />

      </Box>

      <Snackbar

        open={success}

        autoHideDuration={3000}

      >

        <Alert severity="success">

          Booking created successfully.

        </Alert>

      </Snackbar>

      <Snackbar

        open={!!error}

        autoHideDuration={6000}

        onClose={() => setError(null)}

      >

        <Alert severity="error" onClose={() => setError(null)}>

          {error}

        </Alert>

      </Snackbar>

      <Dialog
        open={isUnavailableDialogOpen}
        onClose={() => setIsUnavailableDialogOpen(false)}
        aria-labelledby="unavailable-dialog-title"
        aria-describedby="unavailable-dialog-description"
      >
        <DialogTitle id="unavailable-dialog-title">
          {"Bike Unavailable"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="unavailable-dialog-description">
            Bike is already booked.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUnavailableDialogOpen(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

    </Container>

  );

};

export default CreateBooking;

import { useState } from "react";
import {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
    MenuItem
} from "@mui/material";

import type { BookingRequest } from "../../types/booking";

interface Props {
    bikeId: number;
    onSubmit: (booking: BookingRequest) => void;
    loading?: boolean;
}

const timeSlots: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        const period = h >= 12 ? "PM" : "AM";
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        const padHour = String(displayHour).padStart(2, "0");
        const padMin = String(m).padStart(2, "0");
        const val = `${String(h).padStart(2, "0")}:${padMin}`;
        const label = `${padHour}:${padMin} ${period}`;
        timeSlots.push({ value: val, label });
    }
}

const getTodayDateString = () => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().split("T")[0];
};

const BookingForm = ({
    bikeId,
    onSubmit,
    loading = false
}: Props) => {
    const [startDate, setStartDate] = useState(getTodayDateString());
    const [startTime, setStartTime] = useState("09:00");
    const [returnDate, setReturnDate] = useState(getTodayDateString());
    const [returnTime, setReturnTime] = useState("18:00");

    const [startError, setStartError] = useState<string | null>(null);
    const [returnError, setReturnError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStartError(null);
        setReturnError(null);

        if (!startDate) {
            setStartError("Pickup date is required");
            return;
        }
        if (!returnDate) {
            setReturnError("Return date is required");
            return;
        }

        const startDT = new Date(`${startDate}T${startTime}:00`);
        const returnDT = new Date(`${returnDate}T${returnTime}:00`);

        const now = new Date();
        // Give 1 minute tolerance
        now.setMinutes(now.getMinutes() - 1);

        if (startDT < now) {
            setStartError("Please select a future pickup time.");
            return;
        }

        if (returnDT <= startDT) {
            setReturnError("Return time must be after pickup time.");
            return;
        }

        onSubmit({
            bikeId,
            startTime: `${startDate}T${startTime}:00`,
            returnTime: `${returnDate}T${returnTime}:00`
        });
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                borderRadius: 3
            }}
        >
            <Typography
                variant="h5"
                mb={3}
                fontWeight="bold"
            >
                Book This Bike
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit}
            >
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <TextField
                            fullWidth
                            type="date"
                            label="Pickup Date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            error={!!startError}
                            helperText={startError}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <TextField
                            fullWidth
                            select
                            label="Pickup Time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        >
                            {timeSlots.map((slot) => (
                                <MenuItem key={slot.value} value={slot.value}>
                                    {slot.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <TextField
                            fullWidth
                            type="date"
                            label="Return Date"
                            InputLabelProps={{ shrink: true }}
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            error={!!returnError}
                            helperText={returnError}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sm={6}
                    >
                        <TextField
                            fullWidth
                            select
                            label="Return Time"
                            value={returnTime}
                            onChange={(e) => setReturnTime(e.target.value)}
                        >
                            {timeSlots.map((slot) => (
                                <MenuItem key={slot.value} value={slot.value}>
                                    {slot.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            size="large"
                            sx={{ borderRadius: 2 }}
                        >
                            {loading ? "Booking..." : "Confirm Booking"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default BookingForm;

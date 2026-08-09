import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";

import type { BookingRequest } from "../../types/booking";

const schema = yup.object({

    startTime: yup
        .string()
        .required("Start time is required")
        .test("is-future", "Start time cannot be in the past", (value) => {
            if (!value) return false;
            const now = new Date();
            now.setMinutes(now.getMinutes() - 5);
            const start = new Date(value);
            return start >= now;
        }),

    returnTime: yup
        .string()
        .required("Return time is required")
        .test("is-after-start", "Return time must be after start time", function (value) {
            const { startTime } = this.parent;
            if (!value || !startTime) return false;
            const start = new Date(startTime);
            const returnT = new Date(value);
            return returnT > start;
        })

});

type BookingFormValues = Pick<BookingRequest, "startTime" | "returnTime">;

interface Props {

    bikeId: number;

    onSubmit: (booking: BookingRequest) => void;

    loading?: boolean;

}

const BookingForm = ({
    bikeId,
    onSubmit,
    loading = false
}: Props) => {

    const {

        register,

        handleSubmit,

        formState: { errors }

    } = useForm<BookingFormValues>({

        resolver: yupResolver(schema),

        defaultValues: {

            startTime: "",

            returnTime: ""

        }

    });

    const submit = (data: BookingFormValues) => {

        onSubmit({ ...data, bikeId });

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
            >
                Book This Bike
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit(submit)}
            >

                <Grid
                    container
                    spacing={3}
                >

                    <Grid
                        item
                        xs={12}
                    >

                        <TextField

                            fullWidth

                            type="datetime-local"

                            label="Start Time"

                            InputLabelProps={{
                                shrink: true
                            }}

                            {...register("startTime")}

                            error={!!errors.startTime}

                            helperText={
                                errors.startTime?.message
                            }

                        />

                    </Grid>

                    <Grid
                        item
                        xs={12}
                    >

                        <TextField

                            fullWidth

                            type="datetime-local"

                            label="Return Time"

                            InputLabelProps={{
                                shrink: true
                            }}

                            {...register("returnTime")}

                            error={!!errors.returnTime}

                            helperText={
                                errors.returnTime?.message
                            }

                        />

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

                        >

                            {loading
                                ? "Booking..."
                                : "Confirm Booking"}

                        </Button>

                    </Grid>

                </Grid>

            </Box>

        </Paper>

    );

};

export default BookingForm;

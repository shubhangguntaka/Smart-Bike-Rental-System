import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
    Button
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { useNavigate } from "react-router-dom";

import type { Booking } from "../../types/booking";
import { BookingService } from "../../services/bookingService";

const OwnerBookings = () => {

    const navigate = useNavigate();

    const [bookings, setBookings] =
        useState<Booking[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [message, setMessage] =
        useState("");

    const [openSnackbar, setOpenSnackbar] =
        useState(false);

    useEffect(() => {

        loadBookings();

    }, []);

    async function loadBookings() {

        try {

            setLoading(true);

            const data =
                await BookingService.getAllBookings();

            setBookings(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    const updateStatus = async (

        bookingId: number,

        status: string

    ) => {

        try {

            await BookingService.updateBookingStatus(

                bookingId,

                status

            );

            setMessage(

                `Booking ${status.toLowerCase()} successfully.`

            );

            setOpenSnackbar(true);

            loadBookings();

        } catch (error) {

            console.error(error);

        }

    };

    const filteredBookings = useMemo(() => {

        return bookings.filter((booking) => {

            const searchMatch =

                booking.bookingReference
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                booking.customerId
                    .toString()
                    .includes(search);

            const statusMatch =

                statusFilter === "ALL"

                    ? true

                    : booking.bookingStatus === statusFilter;

            return searchMatch && statusMatch;

        });

    }, [bookings, search, statusFilter]);

    const getChipColor = (status: string) => {

        switch (status) {

            case "PENDING":
                return "warning";

            case "CONFIRMED":
                return "success";

            case "COMPLETED":
                return "info";

            case "CANCELLED":
                return "error";

            default:
                return "default";
        }

    };

    const columns: GridColDef[] = [

        {
            field: "bookingReference",
            headerName: "Reference",
            flex: 1.4
        },

        {
            field: "customerId",
            headerName: "Customer",
            flex: 1
        },

        {
            field: "pickupDate",
            headerName: "Pickup",
            flex: 1
        },

        {
            field: "returnDate",
            headerName: "Return",
            flex: 1
        },

        {
            field: "totalAmount",
            headerName: "Amount",
            flex: 1,
            renderCell: params => `₹ ${params.value}`
        },

        {
            field: "bookingStatus",
            headerName: "Status",
            flex: 1,

            renderCell: params => (

                <Chip

                    label={params.value}

                    color={

                        getChipColor(

                            params.value

                        ) as any

                    }

                    size="small"

                />

            )

        },

        {

            field: "actions",

            headerName: "Actions",

            flex: 2,

            sortable: false,

            renderCell: params => (

                <Stack

                    direction="row"

                    spacing={1}

                >

                    <Button

                        size="small"

                        startIcon={<VisibilityIcon />}

                        onClick={() =>

                            navigate(

                                `/customer/bookings/${params.row.bookingId}`

                            )

                        }

                    >

                        View

                    </Button>

                    {

                        params.row.bookingStatus === "PENDING" && (

                            <Button

                                size="small"

                                color="success"

                                startIcon={<CheckCircleIcon />}

                                onClick={() =>

                                    updateStatus(

                                        params.row.bookingId,

                                        "CONFIRMED"

                                    )

                                }

                            >

                                Confirm

                            </Button>

                        )

                    }

                    {

                        params.row.bookingStatus === "CONFIRMED" && (

                            <Button

                                size="small"

                                color="primary"

                                startIcon={<TaskAltIcon />}

                                onClick={() =>

                                    updateStatus(

                                        params.row.bookingId,

                                        "COMPLETED"

                                    )

                                }

                            >

                                Complete

                            </Button>

                        )

                    }

                </Stack>

            )

        }

    ];

    return (

        <Container maxWidth="xl">

            <Box mt={4}>

                <Typography

                    variant="h4"

                    mb={3}

                >

                    Owner Bookings

                </Typography>

                <Paper sx={{ p: 3 }}>

                    <Stack

                        direction={{

                            xs: "column",

                            md: "row"

                        }}

                        spacing={2}

                        mb={3}

                    >

                        <TextField

                            fullWidth

                            label="Search Booking"

                            value={search}

                            onChange={(e) =>

                                setSearch(

                                    e.target.value

                                )

                            }

                        />

                        <FormControl

                            sx={{ minWidth: 220 }}

                        >

                            <InputLabel>

                                Status

                            </InputLabel>

                            <Select

                                value={statusFilter}

                                label="Status"

                                onChange={(e: SelectChangeEvent) =>

                                    setStatusFilter(

                                        e.target.value

                                    )

                                }

                            >

                                <MenuItem value="ALL">

                                    All

                                </MenuItem>

                                <MenuItem value="PENDING">

                                    Pending

                                </MenuItem>

                                <MenuItem value="CONFIRMED">

                                    Confirmed

                                </MenuItem>

                                <MenuItem value="COMPLETED">

                                    Completed

                                </MenuItem>

                                <MenuItem value="CANCELLED">

                                    Cancelled

                                </MenuItem>

                            </Select>

                        </FormControl>

                    </Stack>

                    {

                        loading ?

                            (

                                <Box

                                    display="flex"

                                    justifyContent="center"

                                    py={8}

                                >

                                    <CircularProgress />

                                </Box>

                            )

                            :

                            (

                                <DataGrid

                                    autoHeight

                                    rows={filteredBookings}

                                    columns={columns}

                                    getRowId={(row) =>

                                        row.bookingId

                                    }

                                    pageSizeOptions={[5, 10, 20]}

                                />

                            )

                    }

                </Paper>

            </Box>

            <Snackbar

                open={openSnackbar}

                autoHideDuration={3000}

                onClose={() =>

                    setOpenSnackbar(false)

                }

            >

                <Alert severity="success">

                    {message}

                </Alert>

            </Snackbar>

        </Container>

    );

};

export default OwnerBookings;

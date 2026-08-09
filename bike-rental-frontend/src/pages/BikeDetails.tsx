import { useEffect, useState } from "react";

import {
    Container,
    Typography,
    Grid,
    CardMedia,
    Chip
} from "@mui/material";

import { useParams } from "react-router-dom";

import type { Bike } from "../types/bike";

import BikeService from "../services/bikeService";

const BikeDetails = () => {

    const { id } = useParams();

    const [bike, setBike] =
        useState<Bike>();

    useEffect(() => {

        if (id) {

            loadBike(Number(id));

        }

    }, [id]);

    async function loadBike(
        bikeId: number
    ) {

        const data =
            await BikeService.getBikeById(bikeId);

        setBike(data);

    }

    if (!bike) return null;

    return (

        <Container sx={{ mt: 5 }}>

            <Grid container spacing={4}>

                <Grid item md={6}>

                    <CardMedia

                        component="img"

                        image={
                            bike.imageUrl ||
                            "https://placehold.co/600x400"
                        }

                    />

                </Grid>

                <Grid item md={6}>

                    <Typography variant="h4">

                        {bike.bikeName}

                    </Typography>

                    <Typography>

                        {bike.brand} {bike.model}

                    </Typography>

                    <Typography mt={2}>

                        ₹ {bike?.rentalPrice}

                    </Typography>

                    <Typography>

                        {bike.location}

                    </Typography>

                    <Typography>

                        Engine:
                        {bike.engineCapacity} cc

                    </Typography>

                    <Typography>

                        Mileage:
                        {bike.mileage}

                    </Typography>

                    <Chip

                        sx={{ mt: 2 }}

                        color={
                            bike?.bikeStatus === "AVAILABLE"
                                ? "success"
                                : "error"
                        }

                        label={
                            bike?.bikeStatus === "AVAILABLE"
                                ? "Available"
                                : "Booked"
                        }

                    />

                </Grid>

            </Grid>

        </Container>

    );

};

export default BikeDetails;

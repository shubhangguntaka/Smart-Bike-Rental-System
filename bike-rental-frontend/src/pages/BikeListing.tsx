import { useEffect, useState } from "react";

import { Container, Typography } from "@mui/material";

import BikeGrid from "../components/bike/BikeGrid";

import type { Bike } from "../types/bike";

import BikeService from "../services/bikeService";

const BikeListing = () => {

    const [bikes, setBikes] =

        useState<Bike[]>([]);

    useEffect(() => {

        loadBikes();

    }, []);

    async function loadBikes() {

        try {

            const data =

                await BikeService.getAllBikes();

            setBikes(data);

        } catch (error) {

            console.error(error);

        }

    }

    return (

        <Container sx={{ mt: 5 }}>

            <Typography
                variant="h4"
                mb={3}
            >
                Available Bikes
            </Typography>

            <BikeGrid bikes={bikes} />

        </Container>

    );

};

export default BikeListing;

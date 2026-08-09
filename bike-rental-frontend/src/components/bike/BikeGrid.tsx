import { Grid } from "@mui/material";

import BikeCard from "./BikeCard";

import type { Bike } from "../../types/bike";

interface Props {

    bikes: Bike[];

    onView?: (id: number) => void;

}

const BikeGrid = ({
    bikes,
    onView
}: Props) => {

    return (

        <Grid container spacing={3}>

            {bikes.map((bike) => (

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={bike.bikeId}
                >

                    <BikeCard

                        bike={bike}

                    />

                </Grid>

            ))}

        </Grid>

    );

};

export default BikeGrid;

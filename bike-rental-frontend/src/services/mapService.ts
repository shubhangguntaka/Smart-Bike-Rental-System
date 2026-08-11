import api from "@/api/axios";

export const mapService = {

    getNearbyBikes(
        latitude: number,
        longitude: number
    ) {
        return api.get("/maps/nearby-bikes", {
            params: {
                latitude,
                longitude,
            },
        });
    },

    getBikeLocation(
        bikeId: number
    ) {
        return api.get(`/maps/bike/${bikeId}`);
    },

    calculateDistance(
        customerLatitude: number,
        customerLongitude: number,
        bikeId: number
    ) {
        return api.get("/maps/distance", {
            params: {
                customerLatitude,
                customerLongitude,
                bikeId,
            },
        });
    },

    getRoute(
        customerLatitude: number,
        customerLongitude: number,
        bikeId: number
    ) {
        return api.get("/maps/route", {
            params: {
                customerLatitude,
                customerLongitude,
                bikeId,
            },
        });
    },

};
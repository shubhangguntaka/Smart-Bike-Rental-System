const env = {
    API_BASE_URL:
        import.meta.env.VITE_API_BASE_URL ||
        "/api",

    APP_NAME:
        import.meta.env.VITE_APP_NAME ||
        "Bike Rental System",

    TOKEN_KEY:
        "bike_rental_token",

    USER_KEY:
        "bike_rental_user"
};

export default env;
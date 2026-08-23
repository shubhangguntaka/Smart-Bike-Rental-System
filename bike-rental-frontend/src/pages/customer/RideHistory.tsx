import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import useAuth from "@/hooks/useAuth";
import { gpsService } from "@/services/gpsService";

import type { Ride } from "@/types/ride";

function formatDuration(
  duration?: number | null
): string {
  if (duration == null || duration < 0) {
    return "—";
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(
    (duration % 3600) / 60
  );
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatDistance(
  distance?: number | null
): string {
  if (distance == null || distance < 0) {
    return "—";
  }

  return `${distance.toFixed(2)} km`;
}

function formatDateTime(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function RideHistory() {
  const { user } = useAuth();

  const customerId = user?.id;

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const loadRideHistory = async () => {
    if (!customerId) {
      setLoading(false);
      setError(
        "Customer information is not available."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response =
        await gpsService.getCustomerRides(
          customerId
        );

      setRides(response.data ?? []);
    } catch (err: any) {
      console.error(
        "Failed to load ride history:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load ride history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRideHistory();
  }, [customerId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Ride History
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          View your previous rides, distance and
          duration.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadRideHistory}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          minHeight="300px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Box>
      ) : rides.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
          >
            No rides found
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Your completed rides will appear here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {rides.map((ride) => {
            const status =
              ride.status ?? "UNKNOWN";

            return (
              <Grid
                item
                xs={12}
                md={6}
                lg={4}
                key={ride.rideId}
              >
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                        >
                          Ride #{ride.rideId}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Booking #{ride.bookingId}
                        </Typography>
                      </Box>

                      <Chip
                        label={status}
                        color={
                          status === "COMPLETED"
                            ? "success"
                            : status === "ACTIVE"
                              ? "primary"
                              : "default"
                        }
                        size="small"
                      />
                    </Box>

                    <Box
                      display="grid"
                      gridTemplateColumns="1fr 1fr"
                      gap={2}
                      mb={3}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          BIKE
                        </Typography>

                        <Typography fontWeight={600}>
                          #{ride.bikeId}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          DISTANCE
                        </Typography>

                        <Typography fontWeight={600}>
                          {formatDistance(
                            ride.totalDistance
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          DURATION
                        </Typography>

                        <Typography fontWeight={600}>
                          {formatDuration(
                            ride.totalDuration
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          CUSTOMER
                        </Typography>

                        <Typography fontWeight={600}>
                          #{ride.customerId}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        STARTED
                      </Typography>

                      <Typography variant="body2">
                        {formatDateTime(
                          ride.startedAt
                        )}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        ENDED
                      </Typography>

                      <Typography variant="body2">
                        {formatDateTime(
                          ride.endedAt
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
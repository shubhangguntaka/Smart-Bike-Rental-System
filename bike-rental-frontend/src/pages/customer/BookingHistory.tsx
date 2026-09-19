import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, CardContent, CardMedia, Typography, Button, Box, Grid, Divider, Alert, Skeleton, Paper, TextField, MenuItem } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { BookingService } from "../../services/bookingService";
import bikeService from "../../services/bikeService";
import useAuth from "../../hooks/useAuth";
import BookingStatusChip from "../../components/booking/BookingStatusChip";
import CancelBookingDialog from "../../components/booking/CancelBookingDialog";
import type { Booking } from "../../types/booking";
import type { Bike } from "../../types/bike";

const BookingHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const customerId = user?.id || 11;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [bikesMap, setBikesMap] = useState<Record<number, Bike>>({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [historyData, bikesList] = await Promise.all([
        BookingService.fetchBookingHistory(customerId),
        bikeService.getAllBikes()
      ]);

      const historyList: Booking[] = Array.isArray(historyData) ? historyData : [];
      setBookings(historyList);
      setFilteredBookings(historyList);

      const map: Record<number, Bike> = {};
      (bikesList || []).forEach((b) => {
        const id = b.bikeId ?? b.id;
        if (id !== undefined) {
          map[id] = b;
        }
      });
      setBikesMap(map);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load booking history.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  // Client-side search and filters
  useEffect(() => {
    let result = bookings;

    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.bookingStatus === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter((b) => {
        const bike = b.bikeId ? bikesMap[b.bikeId] : undefined;
        return (
          b.bookingReference?.toLowerCase().includes(term) ||
          bike?.bikeName?.toLowerCase().includes(term) ||
          b.bikeName?.toLowerCase().includes(term) ||
          String(b.bikeId).includes(term)
        );
      });
    }

    setFilteredBookings(result);
  }, [searchTerm, statusFilter, bookings, bikesMap]);

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelTarget) return;
    const targetId = cancelTarget.bookingId;

    setCancellingId(targetId);
    try {
      await BookingService.cancelBooking(targetId, reason);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === targetId
            ? { ...b, bookingStatus: "CANCELLED", cancellationReason: reason, cancelledBy: "CUSTOMER", cancelledAt: new Date().toISOString() }
            : b
        )
      );
      setCancelTarget(null);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message || (err instanceof Error ? err.message : "Failed to cancel booking.");
      alert(message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");
      return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <HistoryIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight="black" color="primary">
          Booking History
        </Typography>
      </Box>

      {/* Search & Filters */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              aria-label="Search bookings"
              fullWidth
              size="small"
              placeholder="Search by Booking Reference or Bike Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              aria-label="Filter by Status"
              fullWidth
              size="small"
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="VERIFICATION_REQUIRED">Verification Required</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={loadData}>Retry</Button>
        }>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} key={i}>
              <Card sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, borderRadius: 2 }}>
                <Skeleton variant="rectangular" width={240} height={160} animation="wave" />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="30%" sx={{ my: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ mt: 3 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredBookings.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No bookings found.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate("/customer/explore-bikes")}>
            Rent a Bike Now
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => {
            const bike = booking.bikeId ? bikesMap[booking.bikeId] : undefined;
            const isCancellable =
              booking.bookingStatus === "PENDING" ||
              booking.bookingStatus === "VERIFICATION_REQUIRED" ||
              booking.bookingStatus === "APPROVED" ||
              booking.bookingStatus === "CONFIRMED";

            return (
              <Grid item xs={12} key={booking.bookingId}>
                <Card sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  boxShadow: 2,
                  borderRadius: 2,
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: 4
                  }
                }}>
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: "100%", md: 240 }, height: 160, objectFit: "cover" }}
                    image={booking.bikeImage || bike?.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"}
                    alt={booking.bikeName || bike?.bikeName || "Bike"}
                  />
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", p: 3 }}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {booking.bikeName || bike?.bikeName || `Bike ID: #${booking.bikeId}`}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <BookingStatusChip status={booking.bookingStatus} />
                          <BookingStatusChip status={booking.paymentStatus} />
                        </Box>
                      </Box>

                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Booking ID</Typography>
                          <Typography variant="body2" fontWeight="bold">BK-{booking.bookingId}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Booking Date</Typography>
                          <Typography variant="body2">{formatDate(booking.createdAt || booking.bookingDate)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Start Time</Typography>
                          <Typography variant="body2">{formatDateTime(booking.startTime)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Return Time</Typography>
                          <Typography variant="body2">{formatDateTime(booking.returnTime)}</Typography>
                        </Grid>
                      </Grid>

                      {booking.bookingStatus === "CANCELLED" && booking.cancellationReason && (
                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#fff1f0", borderRadius: 1.5, border: "1px solid #ffa39e" }}>
                          <Typography variant="caption" color="error.main" fontWeight="bold" display="block">
                            Cancellation Reason: {booking.cancellationReason}
                            {booking.cancelledBy ? ` (by ${booking.cancelledBy})` : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Total Paid</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          ₹{booking.rentalAmount || booking.totalAmount}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1.5}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/customer/booking/${booking.bookingId}`)}
                        >
                          View Details
                        </Button>
                        {isCancellable && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={cancellingId === booking.bookingId ? <Skeleton variant="circular" width={16} height={16} /> : <CancelIcon />}
                            disabled={cancellingId !== null}
                            onClick={() => setCancelTarget(booking)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CancelBookingDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        isOwner={false}
        loading={cancellingId !== null}
        bookingTitle={cancelTarget ? (cancelTarget.bikeName || `#${cancelTarget.bookingId}`) : ""}
      />
    </Container>
  );
};

export default BookingHistory;

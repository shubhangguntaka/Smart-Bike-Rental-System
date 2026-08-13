import React, { useState, useEffect } from "react";
import { Clock, Shield, ShieldCheck, Sparkles, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { BookingService } from "@/services/bookingService";
import useAuth from "@/hooks/useAuth";
import { format12Hour } from "@/utils/timeUtils";
import { normalizeBike } from "@/utils/bikeUtils";
import { useNavigate } from "react-router-dom";

interface RentBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: any | null;
  onBookingSuccess?: () => void;
}

export default function RentBikeModal({
  isOpen,
  onClose,
  bike: rawBike,
  onBookingSuccess,
}: RentBikeModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const bike = rawBike ? normalizeBike(rawBike) : null;

  // Time & Date State
  const getTodayDateTimeString = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const getReturnDateTimeString = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 3);
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const [pickupDate, setPickupDate] = useState<string>(getTodayDateTimeString());
  const [returnDate, setReturnDate] = useState<string>(getReturnDateTimeString());

  // Unavailable Dialog State
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setPickupDate(getTodayDateTimeString());
      setReturnDate(getReturnDateTimeString());
      setConfirmLoading(false);
    }
  }, [isOpen]);

  const getTimeString = (dateTimeStr: string) => {
    if (!dateTimeStr) return "09:00";
    const parts = dateTimeStr.split(/[T ]/);
    if (parts.length > 1) {
      const timePart = parts[1];
      return timePart.substring(0, 5);
    }
    return "09:00";
  };

  const timeSlots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const hh = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
      const mm = m === 0 ? "00" : `${m}`;
      const valHH = h < 10 ? `0${h}` : `${h}`;
      timeSlots.push({
        value: `${valHH}:${mm}`,
        label: `${hh}:${mm} ${period}`,
      });
    }
  }

  const getFilteredTimeSlots = (selectedDateTimeStr: string) => {
    if (!selectedDateTimeStr) return timeSlots;
    const selectedDateStr = selectedDateTimeStr.split(/[T ]/)[0];
    const todayDateStr = new Date().toISOString().split("T")[0];

    if (selectedDateStr === todayDateStr) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      return timeSlots.filter((slot) => {
        const [slotH, slotM] = slot.value.split(":").map(Number);
        if (slotH > currentHour) return true;
        if (slotH === currentHour && slotM >= currentMinute) return true;
        return false;
      });
    }
    return timeSlots;
  };

  const handleConfirmBooking = async () => {
    if (!bike || !user) {
      toast.error("Please login to proceed with booking.");
      return;
    }

    try {
      setConfirmLoading(true);

      let finalPickup = pickupDate;
      let finalReturn = returnDate;
      const nowTime = new Date();
      const pickupParsed = new Date(finalPickup);
      if (isNaN(pickupParsed.getTime()) || pickupParsed < nowTime) {
        finalPickup = getTodayDateTimeString();
        const retParsed = new Date(finalReturn);
        if (isNaN(retParsed.getTime()) || retParsed <= new Date(finalPickup)) {
          finalReturn = getReturnDateTimeString();
        }
      }

      // Check bike availability from backend
      let isAvailable = true;
      try {
        isAvailable = await BookingService.checkAvailability(
          Number(bike.bikeId || bike.id),
          finalPickup,
          finalReturn
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        if (msg) {
          setUnavailableMessage(msg);
          onClose();
          setIsUnavailableModalOpen(true);
          setConfirmLoading(false);
          return;
        }
      }

      if (bike.bikeStatus === "BOOKED") {
        setUnavailableMessage("This slot is booked at that time. Bike is already accepted and reserved by the owner for another customer.");
        onClose();
        setIsUnavailableModalOpen(true);
        setConfirmLoading(false);
        return;
      }

      if (!isAvailable) {
        onClose();
        setIsUnavailableModalOpen(true);
        setConfirmLoading(false);
        return;
      }

      const bookingRequest = {
        bikeId: Number(bike.bikeId || bike.id),
        startTime: finalPickup,
        returnTime: finalReturn,
      };

      await BookingService.createBooking(Number(user.id), bookingRequest);
      toast.success(`Booking request for ${bike.name} submitted! Waiting for owner approval.`);
      
      onClose();
      onBookingSuccess?.();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Booking request failed. Please check availability.";
      toast.error(errMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      {/* Booking Confirmation Dialog Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => !confirmLoading && onClose()}
        size="md"
      >
        <ModalHeader onClose={() => !confirmLoading && onClose()}>
          Confirm Ride Booking
        </ModalHeader>
        <ModalBody>
          {bike && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="h-16 w-20 rounded-xl object-cover border border-border shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{bike.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">
                    {bike.fuelType} fleet • {bike.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate.split(/[T ]/)[0]}
                    onChange={(e) => setPickupDate(e.target.value + "T" + getTimeString(pickupDate))}
                    className="w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Time</label>
                  <div className="relative flex items-center">
                    <select
                      value={getTimeString(pickupDate)}
                      onChange={(e) => setPickupDate(pickupDate.split(/[T ]/)[0] + "T" + e.target.value)}
                      className="w-full rounded-xl border border-border bg-card pl-2.5 pr-8 py-2 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {getFilteredTimeSlots(pickupDate).map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute right-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return Date</label>
                  <input
                    type="date"
                    value={returnDate.split(/[T ]/)[0]}
                    onChange={(e) => setReturnDate(e.target.value + "T" + getTimeString(returnDate))}
                    className="w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return Time</label>
                  <div className="relative flex items-center">
                    <select
                      value={getTimeString(returnDate)}
                      onChange={(e) => setReturnDate(returnDate.split(/[T ]/)[0] + "T" + e.target.value)}
                      className="w-full rounded-xl border border-border bg-card pl-2.5 pr-8 py-2 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {getFilteredTimeSlots(returnDate).map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute right-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Rental rate</span>
                  <span className="text-foreground font-semibold">₹{bike.price} / hour</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground font-medium">Daily Rate (Est.)</span>
                  <span className="text-foreground font-semibold">₹{bike.rentalPrice || 480} / day</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground font-medium">Verified Identity</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Aadhaar & DL Approved
                  </span>
                </div>
                <div className="border-t border-border pt-3.5 flex justify-between text-sm font-bold">
                  <span>Estimated Total</span>
                  <span className="text-primary font-black">
                    ₹{(() => {
                      const start = new Date(pickupDate);
                      const end = new Date(returnDate);
                      const diffTime = Math.abs(end.getTime() - start.getTime());
                      const diffHours = diffTime / (1000 * 60 * 60);
                      return Math.round(diffHours * bike.price);
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 items-start text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  By confirming, you agree to our Terms of Rental, speed limits, helmet requirements, and verification protocols. Live GPS tracking will be enabled on this ride.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            disabled={confirmLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmLoading}
            onClick={handleConfirmBooking}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {confirmLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            )}
            {confirmLoading ? "Processing..." : "Confirm & Pay"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Unavailable Bike Modal */}
      <Modal
        isOpen={isUnavailableModalOpen}
        onClose={() => setIsUnavailableModalOpen(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setIsUnavailableModalOpen(false)}>
          {unavailableMessage && unavailableMessage.toLowerCase().includes("pending")
            ? "Acceptance Pending by Owner"
            : "Slot Already Booked"}
        </ModalHeader>
        <ModalBody>
          <div className="p-5 text-center space-y-2">
            <h4 className="font-bold text-base text-foreground">
              {unavailableMessage && unavailableMessage.toLowerCase().includes("pending")
                ? "Acceptance Pending by Owner"
                : "This slot is booked at that time"}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {unavailableMessage || "This bike has already been accepted and booked by the owner for another customer during this time slot. Please choose another time slot or select a different bike."}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setIsUnavailableModalOpen(false)}
            className="w-full px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center cursor-pointer"
          >
            OK
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}

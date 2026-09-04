import React, { useState, useEffect, useRef } from "react";
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

  // Smart initial dates tailored to bike operating hours and current time
  const getSmartInitialTimes = (bikeObj?: any) => {
    const now = new Date();
    let shiftStartH = 8;
    let shiftStartM = 0;
    let shiftEndH = 20;
    let shiftEndM = 0;

    if (bikeObj?.availableStartTime) {
      const [sh, sm] = String(bikeObj.availableStartTime).split(":").map(Number);
      if (!isNaN(sh)) {
        shiftStartH = sh;
        shiftStartM = sm || 0;
      }
    }
    if (bikeObj?.availableEndTime) {
      const [eh, em] = String(bikeObj.availableEndTime).split(":").map(Number);
      if (!isNaN(eh)) {
        shiftEndH = eh;
        shiftEndM = em || 0;
      }
    }

    const currentH = now.getHours();
    const currentM = now.getMinutes();

    let pickup = new Date(now);
    // If current time is before shiftStart today, start at shiftStart
    if (currentH < shiftStartH || (currentH === shiftStartH && currentM < shiftStartM)) {
      pickup.setHours(shiftStartH, shiftStartM, 0, 0);
    } else if (currentH >= shiftEndH - 1) {
      // If current time is past or within 1h of shiftEnd today, schedule for tomorrow at shiftStart
      pickup.setDate(pickup.getDate() + 1);
      pickup.setHours(shiftStartH, shiftStartM, 0, 0);
    } else {
      // Within shift: round up to next 30-min block
      const nextH = now.getMinutes() > 30 ? now.getHours() + 1 : now.getHours();
      const nextM = now.getMinutes() > 30 ? 0 : 30;
      pickup.setHours(nextH, nextM, 0, 0);
    }

    let ret = new Date(pickup);
    ret.setHours(ret.getHours() + 2); // 2-hour default rental
    if (ret.getDate() === pickup.getDate() && (ret.getHours() > shiftEndH || (ret.getHours() === shiftEndH && ret.getMinutes() > shiftEndM))) {
      ret.setHours(shiftEndH, shiftEndM, 0, 0);
    }

    const toLocalISO = (d: Date) => {
      const tzoffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
    };

    return {
      pickupStr: toLocalISO(pickup),
      returnStr: toLocalISO(ret),
    };
  };

  const initialTimes = getSmartInitialTimes(bike);
  const [initPDate, initPTime] = initialTimes.pickupStr.split("T");
  const [initRDate, initRTime] = initialTimes.returnStr.split("T");

  const [pickupDate, setPickupDate] = useState<string>(initPDate || "");
  const [pickupTime, setPickupTime] = useState<string>(initPTime || "09:00");
  const [returnDate, setReturnDate] = useState<string>(initRDate || "");
  const [returnTime, setReturnTime] = useState<string>(initRTime || "11:00");

  // Unavailable Dialog State
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState<string>("");

  // Only initialize default times once when modal transitions from closed to open
  const prevIsOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      const times = getSmartInitialTimes(bike);
      const [pDate, pTime] = times.pickupStr.split("T");
      const [rDate, rTime] = times.returnStr.split("T");
      setPickupDate(pDate || "");
      setPickupTime(pTime || "09:00");
      setReturnDate(rDate || "");
      setReturnTime(rTime || "11:00");
      setConfirmLoading(false);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

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

  const getFilteredTimeSlots = (selectedDateStr?: string, currentSelectedTime?: string) => {
    if (!selectedDateStr) return timeSlots;
    const todayDateStr = new Date().toISOString().split("T")[0];

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let shiftStartH = 8;
    let shiftStartM = 0;
    let shiftEndH = 20;
    let shiftEndM = 0;

    if (bike?.availableStartTime) {
      const [sh, sm] = String(bike.availableStartTime).split(":").map(Number);
      if (!isNaN(sh)) {
        shiftStartH = sh;
        shiftStartM = sm || 0;
      }
    }
    if (bike?.availableEndTime) {
      const [eh, em] = String(bike.availableEndTime).split(":").map(Number);
      if (!isNaN(eh)) {
        shiftEndH = eh;
        shiftEndM = em || 0;
      }
    }

    const isOvernight = shiftStartH > shiftEndH;

    const filtered = timeSlots.filter((slot) => {
      const [slotH, slotM] = slot.value.split(":").map(Number);

      // Check if slot is in the past for today (give 5 min tolerance)
      if (selectedDateStr === todayDateStr) {
        if (slotH < currentHour || (slotH === currentHour && slotM < currentMinute - 5)) {
          return false;
        }
      }

      // Check if slot is within operational hours
      if (!isOvernight) {
        if (slotH < shiftStartH || (slotH === shiftStartH && slotM < shiftStartM)) return false;
        if (slotH > shiftEndH || (slotH === shiftEndH && slotM > shiftEndM)) return false;
      } else {
        const inEvening = slotH > shiftStartH || (slotH === shiftStartH && slotM >= shiftStartM);
        const inMorning = slotH < shiftEndH || (slotH === shiftEndH && slotM <= shiftEndM);
        if (!inEvening && !inMorning) return false;
      }

      return true;
    });

    // Ensure currently selected time is always present in dropdown
    if (currentSelectedTime && !filtered.some((s) => s.value === currentSelectedTime)) {
      const existing = timeSlots.find((s) => s.value === currentSelectedTime);
      if (existing) {
        filtered.unshift(existing);
      }
    }

    return filtered.length > 0 ? filtered : timeSlots;
  };

  const handleConfirmBooking = async () => {
    if (!bike || !user) {
      toast.error("Please login to proceed with booking.");
      return;
    }

    try {
      setConfirmLoading(true);

      if (!pickupDate || !pickupTime || !returnDate || !returnTime) {
        toast.error("Please select pickup and return dates and times.");
        setConfirmLoading(false);
        return;
      }

      const finalPickup = `${pickupDate}T${pickupTime}:00`;
      const finalReturn = `${returnDate}T${returnTime}:00`;

      const pickupParsed = new Date(finalPickup);
      const returnParsed = new Date(finalReturn);

      if (isNaN(pickupParsed.getTime()) || isNaN(returnParsed.getTime())) {
        toast.error("Please enter a valid pickup and return date and time.");
        setConfirmLoading(false);
        return;
      }

      const nowTime = new Date();
      nowTime.setMinutes(nowTime.getMinutes() - 5);
      if (pickupParsed < nowTime) {
        toast.error("Pickup time cannot be in the past. Please select a future time.");
        setConfirmLoading(false);
        return;
      }

      if (returnParsed <= pickupParsed) {
        toast.error("Return time must be after pickup time.");
        setConfirmLoading(false);
        return;
      }

      // Check bike availability from backend for the user-selected slot
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
                    min={new Date().toISOString().split("T")[0]}
                    value={pickupDate}
                    onChange={(e) => {
                      setPickupDate(e.target.value);
                      if (!returnDate || returnDate < e.target.value) {
                        setReturnDate(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Time</label>
                  <div className="relative flex items-center">
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card pl-2.5 pr-8 py-2 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {getFilteredTimeSlots(pickupDate, pickupTime).map((slot) => (
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
                    min={pickupDate || new Date().toISOString().split("T")[0]}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return Time</label>
                  <div className="relative flex items-center">
                    <select
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card pl-2.5 pr-8 py-2 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                      {getFilteredTimeSlots(returnDate, returnTime).map((slot) => (
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
                      if (!pickupDate || !pickupTime || !returnDate || !returnTime) return 0;
                      const start = new Date(`${pickupDate}T${pickupTime}:00`);
                      const end = new Date(`${returnDate}T${returnTime}:00`);
                      const diffHours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
                      const rate = bike.hourlyRate || bike.price || Math.round((bike.rentalPrice || 480) / 8);
                      return Math.round(diffHours * rate);
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

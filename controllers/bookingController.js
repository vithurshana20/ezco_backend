import Booking from "../models/Booking.js";
import Court from "../models/Court.js";

// Get available/booked slots for a specific date
export const getSlots = async (req, res) => {
  const { courtId, date } = req.query;
  try {
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // Initialize slots if not already set for that date
    if (!court.availableTimes.has(date)) {
      const slots = [];
      for (let h = 6; h < 22; h++) {
        slots.push({
          start: `${h.toString().padStart(2, '0')}:00`,
          end: `${(h + 1).toString().padStart(2, '0')}:00`,
          status: "available"
        });
      }
      court.availableTimes.set(date, slots);
      court.markModified("availableTimes");
      await court.save();
    }

    const slots = court.availableTimes.get(date);
    res.status(200).json({ date, slots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
};

// Book a slot (only if available)
export const bookSlot = async (req, res) => {
  const { courtId, date, start, end } = req.body;
  try {
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    const slots = court.availableTimes.get(date);
    const slot = slots.find(s => s.start === start && s.end === end);

    if (!slot || slot.status !== "available") {
      return res.status(400).json({ message: "This time slot is already booked or unavailable." });
    }

    // Mark slot as booked
    slot.status = "booked";
    court.markModified("availableTimes");
    await court.save();

    // Create booking
    const booking = new Booking({
      player: req.user._id,
      court: courtId,
      bookingDate: date,
      start,
      end,
      status: "booked"
    });

    await booking.save();
    res.status(201).json({ message: "Slot booked successfully", booking });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the player who booked can cancel
    if (booking.player.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Check if cancellation is within 30 minutes
    const now = new Date();
    const diffMinutes = (now - new Date(booking.createdAt)) / (1000 * 60);
    if (diffMinutes > 30) {
      return res.status(400).json({ message: "Cancellation time expired (30 mins passed)" });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Revert court slot to "available"
    const court = await Court.findById(booking.court);
    const slots = court.availableTimes.get(booking.bookingDate);
    const slot = slots.find(s => s.start === booking.start && s.end === booking.end);
    if (slot) {
      slot.status = "available";
      court.markModified("availableTimes");
      await court.save();
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error cancelling booking", error: err.message });
  }
};

// Get my bookings (for player)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ player: req.user._id }).populate("court");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Get all bookings (admin or owner)
export const getCourtBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("player", "name email")
      .populate("court", "name location");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching court bookings" });
  }
};

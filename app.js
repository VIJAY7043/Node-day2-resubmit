const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Dummy data storage
const rooms = [];
const bookings = [];

// API to create a room
app.post('/api/createRoom', (req, res) => {
    const { roomNumber, seatsAvailable, amenities, pricePerHour } = req.body;

    // Validate input
    if (!roomNumber || !seatsAvailable || !amenities || !pricePerHour) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newRoom = {
        roomNumber,
        seatsAvailable,
        amenities,
        pricePerHour,
    };

    rooms.push(newRoom);
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
});

// API to book a room
app.post('/api/bookRoom', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Validate input
    if (!customerName || !date || !startTime || !endTime || !roomId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if the room is available for booking
    const room = rooms.find((r) => r.roomNumber === roomId);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const conflictingBooking = bookings.find(
        (booking) =>
            booking.roomId === roomId &&
            booking.date === date &&
            ((startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime) ||
                (startTime <= booking.startTime && endTime >= booking.endTime))
    );

    if (conflictingBooking) {
        return res.status(409).json({ error: 'Room already booked for the given date and time' });
    }

    const newBooking = {
        customerName,
        date,
        startTime,
        endTime,
        roomId,
        bookingId: bookings.length + 1,
        bookingDate: new Date(),
        bookingStatus: 'Booked',
    };

    bookings.push(newBooking);
    res.status(201).json({ message: 'Room booked successfully', booking: newBooking });
});

// API to list all rooms with booking data
app.get('/api/listAllRooms', (req, res) => {
    const roomsWithBookings = rooms.map((room) => {
        const roomBookings = bookings.filter((booking) => booking.roomId === room.roomNumber);
        return { ...room, bookings: roomBookings };
    });

    res.json(roomsWithBookings);
});

// API to list all customers with booking data
app.get('/api/listAllCustomers', (req, res) => {
    const customersWithBookings = bookings.map((booking) => {
        const room = rooms.find((r) => r.roomNumber === booking.roomId);
        return { ...booking, roomName: room ? room.roomNumber : null };
    });

    res.json(customersWithBookings);
});

// API to list booking details for a specific customer
app.get('/api/customerBookingDetails/:customerName', (req, res) => {
    const customerName = req.params.customerName;
    const customerBookings = bookings.filter((booking) => booking.customerName === customerName);

    res.json(customerBookings);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

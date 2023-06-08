const express = require('express');
const app = express();
app.use(express.json());

// In-memory data store
let rooms = [];
let bookings = [];

app.get("/",(req,res)=>{
    res.json("hello world")
})

// 1. Creating a Room
app.post('/rooms', (req, res) => {
  const { number, seatsAvailable, amenities, pricePerHour } = req.body;
  const room = { number, seatsAvailable, amenities, pricePerHour };
  rooms.push(room);
  res.json(room);
});

// 2. Booking a Room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  const room = rooms.find(room => room.number === roomId);

  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  if (room.seatsAvailable === 0) {
    res.status(400).json({ error: 'Room is fully booked' });
    return;
  }

  const booking = {
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    bookingId: bookings.length + 1,
    bookingStatus: 'Confirmed'
  };

  bookings.push(booking);
  room.seatsAvailable--;
  res.json(booking);
});

// 3. List all Rooms with Booked Data
app.get('/rooms/bookings', (req, res) => {
  const result = rooms.map(room => {
    const bookingsForRoom = bookings.filter(booking => booking.roomId === room.number);
    const bookedData = bookingsForRoom.map(({ customerName, date, startTime, endTime }) => ({
      roomName: room.number,
      bookedStatus: 'Booked',
      customerName,
      date,
      startTime,
      endTime
    }));
    return bookedData;
  }).flat();

  res.json(result);
});

// 4. List all customers with booked Data
app.get('/customers/bookings', (req, res) => {
  const result = bookings.map(({ customerName, roomId, date, startTime, endTime }) => {
    const room = rooms.find(room => room.number === roomId);
    return {
      customerName,
      roomName: room.number,
      date,
      startTime,
      endTime
    };
  });

  res.json(result);
});

// 5. List how many times a customer has booked the room
app.get('/customers/:customerName/bookings', (req, res) => {
  const customerName = req.params.customerName;
  const result = bookings.filter(booking => booking.customerName === customerName)
    .map(({ customerName, roomId, date, startTime, endTime, bookingId, bookingStatus }) => ({
      customerName,
      roomName: rooms.find(room => room.number === roomId).number,
      date,
      startTime,
      endTime,
      bookingId,
      bookingStatus
    }));

  res.json(result);
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

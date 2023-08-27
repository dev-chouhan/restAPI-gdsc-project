const connectToMongo = require('./db');
const cors = require("cors");
const express = require('express');
const app = express();
const port = 5000;
connectToMongo();

app.use(cors()); // This one is for fetching api through browser.
app.use(express.json());

// available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));


app.get('/', (req, res)=>{
    res.send("Hello Dev!");
});

app.listen(port, ()=>{
    console.log(`Eventmanage API is listed at http://localhost:${port}`);
});

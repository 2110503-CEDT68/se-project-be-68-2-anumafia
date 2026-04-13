const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.headers) mongoSanitize.sanitize(req.headers);
    next();
});

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

//Rate Limiting
const limiter = rateLimit({
    windowMs: 10*60*1000, // 10 mins
    max: 100
});
app.use(limiter);

app.set('query parser', 'extended');

const auth = require('./routes/auth');
const companies = require('./routes/companies');
const interviews = require('./routes/interviews');
const reviews = require('./routes/reviews');
const user = require('./routes/users');

app.use('/api/v1/auth', auth);
app.use('/api/v1/companies', companies);
app.use('/api/v1/interviews', interviews);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/users', user);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

// Handle unhandled promis rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
})
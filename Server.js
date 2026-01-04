const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const cron = require("node-cron");
const User = require('./models/User');
const Employer = require('./models/Employer');

const app = express();

// ✅ CORS MUST COME FIRST
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pixel-ui-six.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/jobs', require('./routes/jobRoute'));
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/premium', require('./routes/premiumRoute'));
app.use('/api/inform', require('./routes/informRoute'));

app.get('/', (req, res) => {
  res.send('Hello backend is working!');
});

connectDB();

// cron job
cron.schedule("* * * * *", async () => {
  const now = new Date();

  await User.updateMany(
    { status: "suspended", suspendedUntil: { $lte: now } },
    { status: "active", suspendedUntil: null, suspensionReason: null }
  );

  await Employer.updateMany(
    { status: "suspended", suspendedUntil: { $lte: now } },
    { status: "active", suspendedUntil: null, suspensionReason: null }
  );
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

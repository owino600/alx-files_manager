// controllers/AuthController.js

const { v4: uuidv4 } = require('uuid');
const redisClient = require('../redisClient'); // Assuming you've set up your Redis client

// Simulated user data (replace with your actual user database)
const users = [
  { id: 1, email: 'user@example.com', passwordHash: 'your_sha1_hash_here' },
  // Add more users as needed
];

// GET /connect
exports.getConnect = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract email and password from Basic auth header
  const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64')
    .toString()
    .split(':');

  // Find user by email and password (replace with your actual logic)
  const user = users.find((u) => u.email === email && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Generate a random token
  const token = uuidv4();

  // Store user ID in Redis with a 24-hour expiration
  redisClient.set(`auth_${token}`, user.id, 'EX', 24 * 60 * 60);

  return res.status(200).json({ token });
};

// GET /disconnect
exports.getDisconnect = (req, res) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Delete token from Redis
  redisClient.del(`auth_${token}`);

  return res.status(204).end();
};

// GET /users/me
exports.getMe = (req, res) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Retrieve user ID from Redis
  redisClient.get(`auth_${token}`, (err, userId) => {
    if (err || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Simulated user object (replace with actual user data)
    const user = users.find((u) => u.id === parseInt(userId, 10));

    // Return user email and ID
    return res.status(200).json({ email: user.email, id: user.id });
  });
};
// controllers/FilesController.js

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../redisClient'); // Assuming you've set up your Redis client

// Simulated user data (replace with your actual user database)
const users = [
  { id: 1, email: 'user@example.com' },
  // Add more users as needed
];

// Environment variable for storing folder path (default: /tmp/files_manager)
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

// Valid file types
const VALID_TYPES = ['folder', 'file', 'image'];

// POST /files
exports.createFile = (req, res) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Retrieve user based on the token
  const user = users.find((u) => u.id === parseInt(redisClient.get(`auth_${token}`), 10));
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, type, parentId, isPublic, data } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }
  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Missing type' });
  }
  if (type !== 'folder' && !data) {
    return res.status(400).json({ error: 'Missing data' });
  }

  // If parentId is set, validate it
  if (parentId) {
    // Simulated check for parent existence (replace with actual logic)
    const parentFile = { type: 'folder' }; // Example: Retrieve parent file from DB
    if (!parentFile || parentFile.type !== 'folder') {
      return res.status(400).json({ error: 'Parent not found or not a folder' });
    }
  }

  // Create a new file document (replace with actual DB logic)
  const newFile = {
    userId: user.id,
    name,
    type,
    isPublic: !!isPublic,
    parentId: parentId || 0,
    localPath: null,
  };

  // If type is folder, save the document and return
  if (type === 'folder') {
    // Save newFile to DB (replace with actual DB logic)
    // ...

    return res.status(201).json(newFile);
  }

  // For file/image type, save the file content locally
  const fileId = uuidv4();
  const filePath = path.join(FOLDER_PATH, fileId);

  // Save Base64 data to local file
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

  // Update localPath in newFile
  newFile.localPath = filePath;

  // Save newFile to DB (replace with actual DB logic)
  // ...

  return res.status(201).json(newFile);
};
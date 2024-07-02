import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const UserQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
    static async postNew(req, res) {
        const { email } = req.body;
        const { password } = req.body;
        
        if (!email) {
            response.status(400).json({ error: 'Missing email' });
            return;
          }
          if (!password) {
            response.status(400).json({ error: 'Missing password' });
            return;
          }
          const user = await dbClient.db.collection('users');
          users.findOne({ email }, async (err, user) => {
            if (user) {
              res.status(400).json({ error: 'Already exist' });
            } else {
              const hashedPassword = sha1(password);
              users.insertOne({
                _id: new ObjectID(),
                email,
                password: hashedPassword,
              },
            ).then((result) => {
                response.status(201).json({ id: result.insertedId, email });
                userQueue.add({ userId: result.insertedId });
              }).catch((error) => console.log(error));
            }
        });
    }

    static async getMe(req, res) {
        const token = req.header('X-Token');
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        if (userId) {
          const users = dbClient.db.collection('users');
          const idObject = new ObjectID(userId);
          users.findOne({ _id: idObject }, (err, user) => {
            if (user) {
              response.status(200).json({ id: userId, email: user.email });
            } else {
              res.status(401).json({ error: 'Unauthorized' });
            }
          });
        } else {
          console.log('Not Found!');
          response.status(401).json({ error: 'Unauthorized' });
        }
    }
}
module.exports = UsersController;

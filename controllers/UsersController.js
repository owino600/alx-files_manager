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
    }

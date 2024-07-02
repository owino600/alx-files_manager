import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on('error', (err) => console.log('Redis client not connected to the server: ', err));
        this.client.on('connect', () => {
            console.log('Redis client connected to the server');
        });
    }

    //  a function isAlive that returns true when the connection to Redis is a success otherwise, false
    isAlive() {
        if (this.client.connected) {
            return true;
          }
          return false;
    }

    // asynchronous function get that takes a string key as argument and returns the Redis value stored for this key
    get(key) {
        const getAsync = promisify(this.client.get).bind(this.client);
        return getAsync(key);
    }

    // asynchronous function set that takes a string key, a value and a duration in second as arguments to
    // store it in Redis (with an expiration set by the duration argument)
    set(key, value, duration) {
        const setAsync = promisify(this.client.set).bind(this.client);
        return setAsync(key, value, 'EX', duration);
    }

    // del key vale pair from redis server
  async del(key) {
    const redisDel = promisify(this.client.del).bind(this.client);
    await redisDel(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
import dotenv from 'dotenv'
import Redis from 'ioredis';
dotenv.config()

const redis = new Redis({
  host: process.env.REDISHOST,
  port: Number(process.env.REDISPORT),
  password: process.env.REDISPASSWORD,
});;

redis.on('connect', () => {
  console.log('Redis sunucusuna bağlanıldı.');

  redis.flushall()
    .then(() => {
      console.log('Veritabanı başarıyla temizlendi.');
    })
    .catch((err) => {
      console.error('Veritabanını temizlerken hata:', err);
    })
    .finally(() => {
      redis.quit();
    });
});

// Bağlantı hatalarını dinleme
redis.on('error', (err) => {
  console.error('Redis bağlantı hatası:', err);
});

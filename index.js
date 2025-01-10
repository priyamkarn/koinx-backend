import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import axios from 'axios';
import express from 'express';
import { z } from 'zod';
import router from './routes/koinxRoutes.js';  

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const cryptoSchema = z.object({
  name: z.string(),
  price: z.number(),
  marketCap: z.number(),
  change: z.number(),
});

const fetchCryptoData = async () => {
    try {
      const res = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true'
      );
  
      const { bitcoin, 'matic-network': matic, ethereum } = res.data;
  
      const data = [
        {
          name: 'Bitcoin',
          price: bitcoin.usd,
          marketCap: bitcoin.usd_market_cap,
          change: bitcoin.usd_24h_change,
        },
        {
          name: 'Matic',
          price: matic.usd,
          marketCap: matic.usd_market_cap,
          change: matic.usd_24h_change,
        },
        {
          name: 'Ethereum',
          price: ethereum.usd,
          marketCap: ethereum.usd_market_cap,
          change: ethereum.usd_24h_change,
        },
      ];
  
      const validatedData = data.map((crypto) => cryptoSchema.parse(crypto));
  
      const timestamp = new Date();
      timestamp.setMinutes(0, 0, 0);
  
      const dataWithTimestamp = validatedData.map((crypto) => ({
        ...crypto,
        timestamp,
      }));
  
      for (const crypto of dataWithTimestamp) {
        const existingCrypto = await prisma.crypto.findFirst({
          where: { name: crypto.name, timestamp: crypto.timestamp },
        });
  
        if (!existingCrypto) {
          await prisma.crypto.create({
            data: crypto,
          });
        }
      }
  
      console.log('Crypto data saved successfully.');
    } catch (err) {
      console.error('Error fetching crypto data:', err);
    }
  };
  

cron.schedule('0 */2 * * *', () => {
  console.log('Running scheduled task...');
  fetchCryptoData();
});

fetchCryptoData();

const port = process.env.PORT || 3000;
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

console.log('Scheduled task initialized.');

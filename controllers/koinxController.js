import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const getStats = async (req, res) => {
    const { coin } = req.query;
    try {
      const cryptoData = await prisma.crypto.findFirst({
        where: {
          name: {
            contains: coin.substring(0, 1).toUpperCase() + coin.substring(1),
            mode: 'insensitive',
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      if (!cryptoData)
        return res.status(404).send({ message: 'Coin not found' });
      res.send({
        price: cryptoData.price,
        marketCap: cryptoData.marketCap,
        '24hChange': cryptoData.change,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error fetching stats' });
    }
  };
  const getDeviation = async (req, res) => {
    const { coin } = req.query;
    try {
      const records = await prisma.crypto.findMany({
        where: {
          name: {
            contains: coin.substring(0, 1).toUpperCase() + coin.substring(1),
            mode: 'insensitive',
          },
        },
        orderBy: {
          timestamp: 'desc', 
        },
        take: 100,
      });
  
      if (records.length === 0)
        return res.status(404).send({ message: 'No records found' });
    const prices = records.map((record) => record.price);
    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
    const variance =prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
    const deviation = Math.sqrt(variance);
  
      res.send({ deviation });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error calculating deviation', error });
    }
  };  
  export { getStats, getDeviation };

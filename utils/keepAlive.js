import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

export default function keepAlive() {
  app.listen(port, () => {
    console.log(`KeepAlive server running on port ${port}`);
  });
}

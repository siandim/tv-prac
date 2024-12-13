const fs = require('fs');
const path = require('path');

const generateData = () => {
  const currentTime = new Date().toISOString();
  const data = {
    timestamp: currentTime,
    data: Array.from({ length: 3 }, (_, id) => ({
      id: id + 1,
      temperature: (Math.random() * 10 + 20).toFixed(1), // Random temperature between 20.0 and 30.0
      humidity: Math.floor(Math.random() * 100), // Random humidity between 0 and 100
      status: "normal"
    }))
  };

  fs.writeFileSync(path.join(__dirname, 'dynamicData.json'), JSON.stringify(data, null, 2));
  console.log(`Data generated at ${currentTime}`);
};

// Generate data every 5 seconds
setInterval(generateData, 30000);


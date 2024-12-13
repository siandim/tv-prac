// In your frontend component
'use client';
import { useEffect, useState } from 'react';
interface dataProps {
  timeStamp,
  
}
const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fetchData');
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {data ? (
        <div>
          <h2>Data fetched at {data.timestamp}</h2>
          {data.data.map((item) => (
            <div key={item.id}>
              <p>ID: {item.id}</p>
              <p>Temperature: {item.temperature}°C</p>
              <p>Humidity: {item.humidity}%</p>
              <p>Status: {item.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default MyComponent;

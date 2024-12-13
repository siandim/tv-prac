"use client";
import React, { useEffect, useState } from "react";
import Compass from "@/components/compass/compass";

interface CompassProps {
  stationName: string;
  direction: string;
  angle: number;
}

const CompassPage: React.FC = () => {
  const [direct, setDirect] = useState<CompassProps[]>([]);
  useEffect(() => {
    fetchCompasses();
  }, []);

  const fetchCompasses = async () => {
    const response = await fetch("/api/fetchCompass/");
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch compass data");
    }
    const data = await response.json();
    console.log(data);
    const compasses: CompassProps[] = Object.entries(data).map(([stationName, values]) => {
      const { direction, angle } = values as { direction: string, angle: number };  // Type casting values
      return { stationName, direction, angle };
    });

    setDirect(compasses); 
  };
  return (
    <div>
      <h1>Compass Directions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {direct.map(({ stationName, direction, angle }) => (
          <Compass
            key={stationName}
            stationName={stationName}
            direction={direction}
            angle={angle}
          />
        ))}
      </div>
      <style jsx>{`
        .compass-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default CompassPage;

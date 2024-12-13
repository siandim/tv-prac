'use client'
import React, { useState, useEffect } from "react";
import "../styles.css";

interface TV {
  id: number;
  name: string;
}

const TvList: React.FC = () => {
  const [tvs, setTvs] = useState<TV[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    fetchTvs();
  }, []);

  const fetchTvs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tvs/");
      if (!response.ok) {
        throw new Error("Failed to fetch TVs");
      }
      const data: { "TV names": TV[] } = await response.json();
      setTvs(data["TV names"]);
    } catch (error) {
      console.error("Error fetching TVs:", error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>TV Lists</h1>
     
      {loading ? (
        <p>Loading...</p>
      ) : 
      <div>
        <h2> List of TVs. Click on it to display.</h2>
        <button className="mb-2">
        <a href="/siteCameraAll/" target="_blank" rel="noopener noreferrer"> Display Site Cameras</a>
        </button>
        {tvs.map((tv) => (
          <p key={tv.id} className="mb-2">
             <a href={`/panel/?tvName=${tv.name}&tvId=${tv.id}`} target="_blank" rel="noopener noreferrer">
              <button>
                Display {tv.name}

              </button>
            </a>
        </p>
          ))}
         </div>
      }
    </div>
  );
};

export default TvList;

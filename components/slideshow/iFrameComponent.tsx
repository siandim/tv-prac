import React, { useState, useEffect, useRef } from 'react';

interface IframeComponentProps {
  src: string;
  alt: string;
  preload?: boolean;
}

const IframeComponent: React.FC<IframeComponentProps> = ({ src, alt, preload = false }) => {
  const isSiteCamera = src.includes("kymesonet.org/json/appSiteCam");
  const [scale, setScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const newScale = screenWidth < 768 ? 0.5 : screenWidth < 1024 ? 0.55 : .65;
      setScale(newScale);
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (preload && iframeRef.current) {
      iframeRef.current.src = src;
    }
  }, [preload, src]);

  if (preload) {
    return (
      <iframe
        ref={iframeRef}
        title={alt}
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <iframe
      src={src}
      title={alt}
      className="w-full h-full"
      style={isSiteCamera ? {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${200 / scale}%`,
        height: `${200 / scale}%`,
      } : {
        width: "100%",
        height: "100%",
        border: "none",
      }}
      loading="lazy"
    />
  );
};

export default IframeComponent;


// import React, { useState, useEffect } from 'react';

// interface IframeComponentProps {
//   src: string;
//   alt: string;
// }

// const IframeComponent: React.FC<IframeComponentProps> = ({ src, alt }) => {
//   const isSiteCamera = src.includes("kymesonet.org/json/appSiteCam");
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     const updateScale = () => {
//       const screenWidth = window.innerWidth;
//       //const screenH = window.innerHeight;

//       const newScale = screenWidth < 768 ? 0.5 : screenWidth < 1024 ? 0.55 : .65;
//       setScale(newScale);
//     };
    
//     // Set initial scale
//     updateScale();
//     window.addEventListener('resize', updateScale);
    
//     return () => window.removeEventListener('resize', updateScale);
//   }, []);

//   return (
//     <>
//       <iframe
//         src={src}
//         title={alt}
//         className="w-full h-full"
//         style={isSiteCamera ? {
//           transform: `scale(${scale})`,
//           transformOrigin: "top left",
//           width: `${200 / scale}%`, // Adjust width based on scale
//           height: `${200 / scale}%`, // Adjust height based on scale
//         } : {
//           width: "100%",
//           height: "100%",
//           border: "none",
//         }}
//         loading="lazy"
//       />
//     </>
//   );
// };

// export default IframeComponent;


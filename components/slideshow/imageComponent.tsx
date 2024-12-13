import React, { useRef, useEffect } from 'react';

interface ImageComponentProps {
  src: string;
  alt: string;
  preload?: boolean;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ src, alt, preload = false }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (preload && imgRef.current) {
      imgRef.current.src = src;
    }
  }, [preload, src]);

  if (preload) {
    return <img ref={imgRef} alt={alt} style={{ display: 'none' }} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '170%', height: '170%', transform: 'translate(0%, -22%)' }}
      loading="lazy"
    />
  );
};

export default ImageComponent;


// import React from 'react';


// interface ImageComponentProps {
//   src: string;
//   alt: string;
// }

// const ImageComponent: React.FC<ImageComponentProps> = ({ src, alt }) => (
//   <img
//     src={src}
//     alt={alt}
//     style={{ width: '170%', height: '170%', transform: 'translate(0%, -22%)' }}
//     loading="lazy"
//   />
// );

// export default ImageComponent;

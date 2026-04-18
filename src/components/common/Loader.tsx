import React from 'react';

const Loader = ({ size = 12 }: { size?: number }) => {
  return (
    <>
      <style>{`
        @keyframes customDotPulse {
          0% {
            transform: scale(0.8);
            background-color: #fecaca;
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          50% {
            transform: scale(1.2);
            background-color: #dc2626;
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
          100% {
            transform: scale(0.8);
            background-color: #fecaca;
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
        }

        .custom-dots-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }

        .custom-dot {
          height: ${size}px;
          width: ${size}px;
          margin-right: ${size * 0.66}px;
          border-radius: 50%;
          background-color: #fecaca;
          animation: customDotPulse 1.5s infinite ease-in-out;
        }

        .custom-dot:last-child {
          margin-right: 0;
        }

        .custom-dot:nth-child(1) { animation-delay: -0.3s; }
        .custom-dot:nth-child(2) { animation-delay: -0.1s; }
        .custom-dot:nth-child(3) { animation-delay: 0.1s; }
        .custom-dot:nth-child(4) { animation-delay: 0.3s; }
        .custom-dot:nth-child(5) { animation-delay: 0.5s; }
      `}</style>

      <section className="custom-dots-container">
        <div className="custom-dot" />
        <div className="custom-dot" />
        <div className="custom-dot" />
        <div className="custom-dot" />
        <div className="custom-dot" />
      </section>
    </>
  );
};

export default Loader;

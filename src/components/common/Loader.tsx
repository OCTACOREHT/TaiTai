import React from 'react';
import styled, { keyframes } from 'styled-components';

const dotPulse = keyframes`
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
`;

const Loader = ({ size = 12 }: { size?: number }) => {
  return (
    <StyledWrapper $size={size}>
      <section className="dots-container">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $size: number }>`
  .dots-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .dot {
    height: ${props => props.$size}px;
    width: ${props => props.$size}px;
    margin-right: ${props => props.$size * 0.66}px;
    border-radius: 50%;
    background-color: #fecaca;
    animation: ${dotPulse} 1.5s infinite ease-in-out;
  }

  .dot:last-child {
    margin-right: 0;
  }

  .dot:nth-child(1) {
    animation-delay: -0.3s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.1s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.1s;
  }
  
  .dot:nth-child(4) {
    animation-delay: 0.3s;
  }

  .dot:nth-child(5) {
    animation-delay: 0.5s;
  }
`;

export default Loader;

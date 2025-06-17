import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getTimeDiff = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = Math.max(end - now, 0);

  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

const UrgentGroupBuyCard = ({ item }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeDiff(item.deadline));
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeDiff(item.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [item.deadline]);

  return (
    <div className="product-card" onClick={() => navigate(`/groupbuy/info/${item.id}`)} style={{ cursor: 'pointer' }}>
      <div className="product-image">
        <img src={item.imgUrls?.[0]} alt={item.title} />
      </div>
      <div style={{ padding: '10px' }}>
        <strong>{item.title}</strong><br />
        {item.salePrice.toLocaleString()}원<br />
        <span style={{ color: 'red' }}>⏱ {timeLeft}</span>
      </div>
    </div>
  );
};

export default UrgentGroupBuyCard;

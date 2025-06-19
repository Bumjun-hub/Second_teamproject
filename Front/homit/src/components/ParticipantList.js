// 공동구매 상세 페이지 참가자 목록

import React, { useEffect, useState } from 'react';
import './ParticipantList.css';

const ParticipantList = ({ groupBuyId }) => {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        console.log("groupbyId:", groupBuyId);
        const fetchParticipants = async () => {
            try {
                const res = await fetch(`/api/groupBuy/admin/${groupBuyId}/applyList`, {
                    credentials: 'include'
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    setParticipants(data);

                } else {
                    console.warn('참가자 데이터가 배열이 아님 : ', data);
                    setParticipants([]);
                }

            } catch (err) {
                console.error('참가자 목록 로드 실패:', err);
            }
        };

        fetchParticipants();
    }, [groupBuyId]);

    return (
        <div className='participant-container'>
            <h3>공동구매 참가자 목록</h3>
            <ul className='participant-list'>
                {participants.map((p, i) => (
                    <li key={i} className="participant-item">
                        <span className="participant-name">{p.username}</span>
                        <span className="participant-quantity">수량: {p.quantity}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantList;

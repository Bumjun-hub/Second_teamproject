import { Client } from '@stomp/stompjs';

let stompClient = null;

export function connectNotification(onMessage, accessToken) {
    console.log("🧪 WebSocket 연결에 사용할 accessToken:", accessToken);

    stompClient = new Client({
        brokerURL: "ws://localhost:8080/ws", // ✅ native WebSocket 사용
        connectHeaders: {
            Authorization: `Bearer ${accessToken}` // ✅ STOMP CONNECT 시 헤더로 전달
        },
        debug: (str) => console.log(str),
        reconnectDelay: 5000,

        onConnect: () => {
            console.log("🔔 WebSocket 연결 성공");

            stompClient.subscribe('/user/topic/notification', (msg) => {
                console.log("📨 받은 알림 메시지:", msg.body);
                const notification = JSON.parse(msg.body);
                onMessage(notification);
            });
        },

        onStompError: (frame) => {
            console.error('❌ WebSocket 오류 발생:', frame);
        },
    });

    stompClient.activate();
}

export function disconnectNotification() {
    if (stompClient) {
        stompClient.deactivate();
        console.log("🔌 WebSocket 연결 해제");
    }
}

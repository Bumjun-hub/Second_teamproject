import { Client } from '@stomp/stompjs';

let stompClient = null;

export function connectNotification(onMessage) {
    // 기존 연결이 있다면 먼저 해제
    if (stompClient) {
        disconnectNotification();
    }

    console.log("🔌 WebSocket 연결 시도...");

    stompClient = new Client({
        brokerURL: "ws://localhost:8080/ws",
        debug: (str) => console.log("STOMP:", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
            console.log("✅ WebSocket 연결 성공:", frame);

            // ✅ 구독 경로 수정 (/user/topic/notification)
            const subscription = stompClient.subscribe('/user/topic/notification', (msg) => {
                console.log("📨 받은 알림 메시지:", msg.body);
                try {
                    const notification = JSON.parse(msg.body);
                    onMessage(notification);
                } catch (error) {
                    console.error("알림 메시지 파싱 오류:", error);
                    onMessage({ content: msg.body }); // 파싱 실패 시 원본 전달
                }
            });

            console.log("🔔 알림 구독 완료:", subscription);
        },

        onStompError: (frame) => {
            console.error('❌ STOMP 오류:', frame.headers['message']);
            console.error('상세 내용:', frame.body);
        },

        onWebSocketError: (error) => {
            console.error('❌ WebSocket 오류:', error);
        },

        onDisconnect: (frame) => {
            console.log("🔌 WebSocket 연결 해제:", frame);
        }
    });

    try {
        stompClient.activate();
    } catch (error) {
        console.error("❌ WebSocket 활성화 실패:", error);
    }
}

export function disconnectNotification() {
    if (stompClient && stompClient.active) {
        try {
            stompClient.deactivate();
            console.log("🔌 WebSocket 연결 해제 완료");
        } catch (error) {
            console.error("WebSocket 해제 중 오류:", error);
        }
    }
    stompClient = null;
}
import IResolumeTransport, { ResolumeMessageCallback, ResolumeConnectionCallback } from './IResolumeTransport';
import RequestMessage from './RequestMessage';


/**
 *  Transport class that maintains the connection
 *  to the server
 */
class ResolumeTransport implements IResolumeTransport {
    connect(host: string, port: number): void {
        this.disconnect();

        this.host = host;
        this.port = port;

        this.socket = new WebSocket(`ws://${host}:${port}/api/v1`);

        this.socket.onmessage = message => {
            const data = JSON.parse(message.data);
            console.log('receive', data);

            for (const callback of this.callbacks) {
                callback(data);
            }
        };

        this.socket.onopen = () => {
            for (const callback of this.stateCallbacks) {
                callback(true);
            }
        };

        this.socket.onclose = this.socket.onerror = () => {
            for (const callback of this.stateCallbacks) {
                callback(false);
            }
        };
    }

    disconnect(): boolean {
        if (this.socket !== undefined) {
            // 1000 is the value for normal closure
            this.socket.close(1000);
            this.socket = undefined;

            return true;
        } else {
            return false;
        }
    }

    sendMessage(message: RequestMessage): void {
        if (this.socket !== undefined) {
            this.socket.send(JSON.stringify(message));
            console.log('send', message);
        }
    }

    addMessageListener(callback: ResolumeMessageCallback): void {
        this.callbacks.push(callback);
    }

    removeMessageListener(callback: ResolumeMessageCallback): void {
        const index = this.callbacks.indexOf(callback);

        if (index !== -1) {
            this.callbacks.splice(index, 1);
        }
    }

    addConnectionStateListener(callback: ResolumeConnectionCallback): void {
        this.stateCallbacks.push(callback);
    }

    removeConnectionStateListener(callback: ResolumeConnectionCallback): void {
        const index = this.stateCallbacks.indexOf(callback);

        if (index !== -1) {
            this.stateCallbacks.splice(index, 1);
        }
    }

    host: string = "localhost";
    port: number = 8080;

    private socket?: WebSocket = undefined;
    private callbacks: ResolumeMessageCallback[] = [];
    private stateCallbacks: ResolumeConnectionCallback[] = [];
};

export default ResolumeTransport;

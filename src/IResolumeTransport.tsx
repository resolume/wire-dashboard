import RequestMessage from './RequestMessage';
import ResponseMessage from './ResponseMessage';

export type ResolumeMessageCallback = (message: ResponseMessage) => void;
export type ResolumeConnectionCallback = (connected: boolean) => void;

interface IResolumeTransport {
    reconnect: () => void;
    sendMessage: (message: RequestMessage) => void;
    addMessageListener: (callback: ResolumeMessageCallback) => void;
    removeMessageListener: (callback: ResolumeMessageCallback) => void;
    addConnectionStateListener: (callback: ResolumeConnectionCallback) => void;
    removeConnectionStateListener: (callback: ResolumeConnectionCallback) => void;
}

export default IResolumeTransport;

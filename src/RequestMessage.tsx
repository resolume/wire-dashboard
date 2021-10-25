import RequestAction from './RequestAction';

/**
 *  Requests that can be sent to the
 *  server. The values are used when
 *  updating inputs.
 */
interface RequestMessage {
    id?: number,
    action: RequestAction,
    path: string,
    values?: any[]
};

export default RequestMessage;

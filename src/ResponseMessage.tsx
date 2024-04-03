import ResponseType from './ResponseType.d';

/**
 *  The interface all messages from the server
 *  must adhere to. The `type` property indicates
 *  what kind of data to expect in `response`.
 */
interface ResponseMessage {
    type: ResponseType,
    request_id: number | null,
    request_path: string | null,
    response: any
};

export default ResponseMessage;

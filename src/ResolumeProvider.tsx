import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Product from './Product';
import Patch, { PatchCategory } from './Patch';
import IResolumeTransport from './IResolumeTransport';
import ResolumeTransport from './ResolumeTransport';
import ResponseMessage from './ResponseMessage';
import ResponseType from './ResponseType';
import RequestAction from './RequestAction';
import IInput from './IInput';

/**
 *  The properties that we export from
 *  the resolume context
 */
type ResolumeContextProperties = {
    product: Product,
    patch: Patch,
    inputs: IInput[],
    connected: boolean,
    transport: IResolumeTransport,
    subscribe: (id: number) => void,
    unsubscribe: (id: number) => void
}

/**
 *  The properties the provider
 *  requires.
 */
type ResolumeContextParameters = {
    children: React.ReactNode,
    host: string,
    port: number
};

export const ResolumeContext = createContext<ResolumeContextProperties | undefined>(undefined);

const emptyProduct: Product = {
    name: "",
    major: 0,
    minor: 0,
    micro: 0,
    revision: 0
};

const emptyPatch: Patch = {
    description: "",
    display_name: "",
    category: PatchCategory.Source,
    video: { width: 0, height: 0 },
    credits: {
        author: "",
        vendor: "",
        email: "",
        url: ""
    },
    license: {
        name: "",
        file: ""
    },
    identifier: ""
};

const ResolumeProvider = (props: ResolumeContextParameters) => {
    const [ product, setProduct ] = useState<Product>(emptyProduct);
    const [ patch, setPatch ] = useState<Patch>(emptyPatch);
    const [ inputs, setInputs ] = useState<IInput[]>([]);
    const [ connected, setConnected ] = useState<boolean>(false);

    const transportRef = useRef<ResolumeTransport>(new ResolumeTransport());
    const subscriptionsRef = useRef<Map<number, number>>(new Map<number, number>());

    // this is of course strange, it'd be much easier to directly retrieve
    // the 'current' property when declaring the ref, but that leads to
    // strange issues when using effects later on
    const transport = transportRef.current;

    useEffect(() => {
        const transport = transportRef.current;

        // handle incoming messages
        const messageListener = (message: ResponseMessage) => {
            switch (message.type) {
                case ResponseType.GetPatch:
                    setPatch(message.response as Patch);
                    break;
                case ResponseType.GetInputs:
                    setInputs(message.response);
                    break;
                case ResponseType.GetInput:
                case ResponseType.UpdateInput:
                case ResponseType.InputSubscribed:
                    // replace the input with matching id with
                    // the updated value sent by the server
                    setInputs(inputs.map(input => {
                        // the update to compare with
                        const update = message.response as IInput;

                        // is this the input that is updated
                        if (input.id === update.id) {
                            return update;
                        } else {
                            return input;
                        }
                    }));

                    break;
                case ResponseType.InputAdded:
                    // add the new input to the existing inputs
                    setInputs([...inputs, message.response as IInput]);
                    break;
                case ResponseType.InputRemoved:
                    // filter out the input with matching id
                    setInputs(inputs.filter(input => input.id !== message.response as number));
                    break;
                case ResponseType.InputsReordered:
                    // we get a list of ids in the new order, so we can sort what we already have
                    const ids = message.response as number[];
                    setInputs([...inputs].sort((lhs, rhs) => ids.indexOf(lhs.id) - ids.indexOf(rhs.id)));
                    break;
            }
        };

        // handle connection state changes
        const stateListener = (connected: boolean) => {
            setConnected(connected);

            if (connected) {
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('load', event => setProduct(JSON.parse(xhr.responseText)));
                xhr.open('GET', `//${transport.host}:${transport.port}/api/v1/product`);
                xhr.send();
            } else {
                setProduct(emptyProduct);
                setPatch(emptyPatch);
                setInputs([]);
            }
        };

        // subscribe to events
        transport.addMessageListener(messageListener);
        transport.addConnectionStateListener(stateListener);

        // unsubscribe when the provider is removed
        return () => {
            transport.removeMessageListener(messageListener);
            transport.removeConnectionStateListener(stateListener);
        }
    }, [inputs]);

    // reconnect when the host or port changes
    useEffect(() => {
        const transport = transportRef.current;

        transport.connect(props.host, props.port);
        return (): void => { transport.disconnect(); };
    }, [props.host, props.port])

    const subscribe = useCallback((id: number): void => {
        const transport = transportRef.current;
        const subscriptions = subscriptionsRef.current;

        // get the current number of subscriptions for the input
        const count = subscriptions.get(id) || 0;

        // is this the first subscription? register with the backend
        if (count === 0) {
            // request a new subscription on the input
            transport.sendMessage({
                action: RequestAction.Subscribe,
                path: `/input/${id}`,
            });
        }

        // update subscription count
        subscriptions.set(id, count + 1);
    }, []);

    const unsubscribe = useCallback((id: number): void => {
        const transport = transportRef.current;
        const subscriptions = subscriptionsRef.current;

        // get the current number of subscriptions
        const count = subscriptions.get(id) || 0;

        // is this the last subscription?
        if (count === 1) {
            // we should stop monitoring the input
            transport.sendMessage({
                action: RequestAction.Unsubscribe,
                path: `/input/${id}`,
            });

            // completely remove the key
            subscriptions.delete(id);
        } else if (count > 0) {
            // store reduced subscription count
            subscriptions.set(id, count - 1);
        }
    }, []);

    return (
        <ResolumeContext.Provider value={{ product, patch, inputs, connected, transport, subscribe, unsubscribe }}>
            {props.children}
        </ResolumeContext.Provider>
    );
};

// use the created context and check that it is valid
// (i.e. it is used within a <ResolumeProvider> component
export const useResolumeContext = (): ResolumeContextProperties => {
    const properties = useContext(ResolumeContext);

    if (properties === undefined) {
        throw new Error("Context may only be used within ResolumeProvider");
    }

    return properties as ResolumeContextProperties;
}

export default ResolumeProvider;

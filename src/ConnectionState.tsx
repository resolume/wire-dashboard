import React from 'react';
import { useResolumeContext } from './ResolumeProvider';
import './ConnectionState.css';

/**
 *  Render the current connection state,
 *  with product information if connected
 */
function ConnectionState() {
    const { connected, transport, product } = useResolumeContext();

    if (connected) {
        return (
            <span className="connection-state connected">Connected to Resolume {product.name} {product.major}.{product.minor}.{product.micro}</span>
        )
    } else {
        return (
            <span className="connection-state disconnected">
                Disconnected from server backend, 
                <button onClick={() => transport.reconnect()}>reconnect</button>
            </span>
        )
    }
}

export default ConnectionState;

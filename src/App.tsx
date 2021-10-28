import React from 'react';
import ResolumeProvider from './ResolumeProvider';
import ConnectionState from './ConnectionState';
import InputList from './InputList';
import './App.css';

/**
 *  Retrieve an option
 *
 *  @param  production  The option to use when the app is ran in production
 *  @param  development The option to use when the app is run in debug mode
 *  @param  fallback    The option to use when run in debug with an invalid option for development
 *  @return The selected option
 */
function GetOption(production: string, development: string | undefined, fallback: string): string {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
        return production;
    } else if (development) {
        return development!;
    } else {
        return fallback;
    }
}

/**
 *  Determine host and port to use
 *
 *  In production we assume the same host and port as we're connected to,
 *  since we'll probably be served from within the wire server. On debug
 *  we default to localhost:8080, unless environment variables are set
 */
const host = GetOption(window.location.hostname, process.env.REACT_APP_HOST, '127.0.0.1');
const port = parseInt(GetOption(window.location.port, process.env.REACT_APP_PORT, "8080"), 10);

function App() {
    return (
        <ResolumeProvider host={host} port={port}>
            <ConnectionState />
            <InputList />
        </ResolumeProvider>
    );
}

export default App;

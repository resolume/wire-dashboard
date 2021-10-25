import React from 'react';
import ResolumeProvider from './ResolumeProvider';
import ConnectionState from './ConnectionState';
import InputList from './InputList';
import './App.css';

function App() {
    return (
        <ResolumeProvider host={"127.0.0.1"} port={8080}>
            <ConnectionState />
            <InputList />
        </ResolumeProvider>
    );
}

export default App;

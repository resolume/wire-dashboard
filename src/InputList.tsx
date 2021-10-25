import React from 'react';
import IInput from './IInput';
import Input from './Input';
import { useResolumeContext } from './ResolumeProvider';
import './InputList.css';


function InputList() {
    const inputs = useResolumeContext().inputs.map((input: IInput) =>
        <Input key={input.id} {...input} />
    );

    return (
        <div className="inputs">
            <div className="header">inputs</div>
            <div>{inputs}</div>
        </div>
    )
}

export default InputList;

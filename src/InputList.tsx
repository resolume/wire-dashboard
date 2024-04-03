import React from 'react';
import IInput from './IInput';
import Input from './Input';
import IInputGroup from './IInputGroup.d';
import InputGroup from './InputGroup';
import { useResolumeContext } from './ResolumeProvider';
import './InputList.css';


function InputList() {
    // discriminate between inputs and groups
    function isInputGroup(input: IInput | IInputGroup): input is IInputGroup {
        return (input as IInputGroup).inputs !== undefined;
    }

    const inputs = useResolumeContext().inputs.map((input: IInput | IInputGroup) => {
        if (isInputGroup(input)) {
            return <InputGroup key={input.id} group={input} />;
        } else {
            return <Input key={input.id} {...input} />;
        }       
    });

    const { display_name, description } = useResolumeContext().patch;

    return (
        <div className="inputs">
            <div className="header">
                <span>inputs for </span>
                <span title={description}>{display_name}</span>
            </div>
            <div>{inputs}</div>
        </div>
    )
}

export default InputList;

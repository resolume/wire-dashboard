import React, { useEffect, useState } from 'react';
import IInput, { DataType, IInputWithValues } from './IInput';
import { useResolumeContext } from './ResolumeProvider';
import RequestAction from './RequestAction';
import './Input.css';


/**
 *  This is for showing an input showing regular
 *  data, like text or numbers
 */
function InputData<ValueType extends {}>(input: IInputWithValues<ValueType>) {
    const { transport } = useResolumeContext();

    // keep track of the currently-active input field and the value
    // that it was changed to - we display this value over the stored one
    const [ current , setCurrent ] = useState<string | undefined>(undefined);
    const [ active, setActive ] = useState<number | undefined>(undefined);

    // the type parameter to pass to the input component - this restricts
    // editing to data that is compatible with what the input expects
    const type = ((): string => {
        switch (input.datatype) {
            case DataType.Float:
            case DataType.Integer:
                return "number";
            default:
                return "text";
        }
    })();

    // we have to use any as return type here, because otherwise TS
    // will infer the return type to be number | string, which is not
    // assignable to ValueType (of course)
    const formatter = ((): any => {
        switch (input.datatype) {
            case DataType.Float:
                return parseFloat;
            case DataType.Integer:
                return (value: string) => parseInt(value, 10);
            default:
                return (value: string) => value;
        }
    })();

    const inputs = input.values.map((value, index) => {
        // if we're rendering the input that is being edited right now we use the current
        // value to show in the input, otherwise we'll use the value as set by the server
        const data = index === active && current !== undefined ? current : value.toString();

        // ensure min and max values are compatible with text input
        const min = input.min?.toString() ?? undefined;
        const max = input.max?.toString() ?? undefined;

        // making a change to an input will set the
        // current index and value - this will cause
        // the updated value to be rendered before
        // it is actually sent to the server
        const onChange = (event: any) => {
            setCurrent(event.target.value);
            setActive(index);

            const update = [...input.values];
            update[index] = formatter(event.target.value);

            transport.sendMessage({
                action: RequestAction.Put,
                path: `/input/${input.id}`,
                values: update
            });
        };

        const onBlur = () => {
            if (index === active) {
                setCurrent(undefined);
                setActive(undefined);
            }
        };

        const onStep = (add: number) => {
            const update = [...input.values];
            update[index] = formatter(data) + add;

            transport.sendMessage({
                action: RequestAction.Put,
                path: `/input/${input.id}`,
                values: update
            });
        };

        // if we have both a minimum and maximum value we can show
        // a range slider to move between the two boundaries
        if (min && max) {
            // we show 1000 steps over the available range
            const step = ((input.max as unknown as number) - (input.min as unknown as number)) / 1000;

            return (
                <span className="input-with-slider" key={index}>
                    <input type={type} onChange={onChange} onBlur={onBlur} min={min} max={max} step="any" value={data} />
                    <button onClick={() => onStep(-step)}>-</button>
                    <button onClick={() => onStep(+step)}>+</button>
                    <input type="range" onChange={onChange} onBlur={onBlur} min={min} max={max} step={step} value={data} />
                </span>
            )
        }

        return (
            <input type={type} key={index} onChange={onChange} onBlur={onBlur} min={min} max={max} value={data} />
        )
    });

    return (
        <div className="input data">
            <div className="header">{input.name}</div>
            {inputs}
        </div>
    )
}

/**
 *  Show checkboxes for boolean inputs
 */
function InputBool(input: IInputWithValues<boolean>) {
    const { transport } = useResolumeContext();

    const inputs = input.values.map((value, index) => {
        const onChange = (event: any) => {
            const update = [...input.values];
            update[index] = event.target.checked;

            transport.sendMessage({
                action: RequestAction.Put,
                path: `/input/${input.id}`,
                values: update
            });
        };

        return (
            <input key={index} type="checkbox" checked={value} onChange={onChange} />
        )
    });

    return (
        <div className="input boolean">
            <div className="header">{input.name}</div>
            {inputs}
        </div>
    )
}

function InputTrigger(input: IInput) {
    const { transport } = useResolumeContext();

    // generate the clickable trigger buttons
    const buttons = Array.from(Array(input.instance_count).keys()).map(instance => {
        const trigger = () => {
            transport.sendMessage({
                action: RequestAction.Trigger,
                path: `/input/${input.id}/trigger/${instance}`
            });
        };

        return (
            <button key={instance} onClick={trigger}>Trigger</button>
        )
    });

    return (
        <span className="input trigger">
            <div className="header">{input.name}</div>
            {buttons}
        </span>
    )
}


function Input(input: IInput) {
    const { subscribe, unsubscribe } = useResolumeContext();

    useEffect(() => {
        subscribe(input.id);
        return () => { unsubscribe(input.id) };
    }, [subscribe, unsubscribe, input.id]);

    switch (input.datatype) {
        case DataType.Trigger:
            return <InputTrigger {...input} />;
        case DataType.Float:
        case DataType.Integer:
            return <InputData {...(input as IInputWithValues<number>)} />;
        case DataType.String:
            return <InputData {...(input as IInputWithValues<string>)} />;
        case DataType.Boolean:
            return <InputBool {...(input as IInputWithValues<boolean>)} />;
        default:
            console.log('unknown type', input);
            return (null);
    }
}

export default Input;

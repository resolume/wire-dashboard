import React, { useEffect, useState } from 'react';
import IInput, { Flow, DataType, Float4, IInputWithValues } from './IInput';
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
    const [ current, setCurrent ] = useState<string | undefined>(undefined);
    const [ active, setActive ] = useState<number | undefined>(undefined);

    // if there are choices available we should show a dropdown
    // instead of a regular text/number entry
    if (input.choices && Object.entries(input.choices).length > 0) {
        // all the select inputs to render
        const selects = input.values.map((value, selectIndex) => {
            const options = Object.entries(input.choices!).map((option, choiceIndex) => {
                const [ label ] = option;
                return <option key={choiceIndex} value={choiceIndex}>{label}</option>
            });

            const onChange = (event: any) => {
                const target = event.target;

                const update = [...input.values];
                update[selectIndex] = Object.values(input.choices!)[target.selectedIndex];

                transport.sendMessage({
                    action: RequestAction.Put,
                    path: `/input/${input.id}`,
                    values: update
                });
            }

            const currentIndex = Object.values(input.choices!).indexOf(value);
            return <select key={selectIndex} onChange={onChange} value={currentIndex}>{options}</select>
        });

        return (
            <div className="input select">
                <div className="header">{input.name}</div>
                {selects}
            </div>
        )
    }

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

        // commit changes to an input - for non-attribute
        // inputs this happens directly, but if an input
        // is set to attribute flow this can lead to issues
        // if intermediate values are set
        const commit = (event: any) => {
            if (index !== active)
                return;

            const update = [...input.values];
            update[index] = formatter(event.target.value);

            transport.sendMessage({
                action: RequestAction.Put,
                path: `/input/${input.id}`,
                values: update
            });
        }

        // making a change to an input will set the
        // current index and value - this will cause
        // the updated value to be rendered before
        // it is actually sent to the server
        const onChange = (event: any) => {
            setCurrent(event.target.value);
            setActive(index);

            if (input.flow != Flow.attribute)
                commit(event);
        };

        const onBlur = (event: any) => {
            if (index === active) {
                setCurrent(undefined);
                setActive(undefined);
            }

            if (input.flow == Flow.attribute)
                commit(event);
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
            // we show 1000 steps over the available range for floating point
            const step = input.datatype === DataType.Float ? ((input.max as unknown as number) - (input.min as unknown as number)) / 1000 : 1;

            return (
                <span className="input-with-slider" key={index}>
                    <input type={type} onChange={onChange} onBlur={onBlur} min={min} max={max} step={step} value={data} />
                    <button onClick={() => onStep(-step)}>-</button>
                    <button onClick={() => onStep(+step)}>+</button>
                    <input type="range" onChange={onChange} onBlur={onBlur} onMouseUp={onBlur} min={min} max={max} step={step} value={data} />
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

function InputColor(input: IInputWithValues<Float4>) {
    const { transport } = useResolumeContext();

    const inputs = input.values.map((value, index) => {
        // note: we ignore the alpha value (stored inside 'w')
        const r = Math.round(value.x * 255).toString(16).padStart(2, '0');
        const g = Math.round(value.y * 255).toString(16).padStart(2, '0');
        const b = Math.round(value.z * 255).toString(16).padStart(2, '0');

        const onChange = (event: any) => {
            const color = {
                x: parseInt(event.target.value.slice(1, 3), 16) / 255,
                y: parseInt(event.target.value.slice(3, 5), 16) / 255,
                z: parseInt(event.target.value.slice(5, 7), 16) / 255,
                w: 1
            }

            const update = [...input.values];
            update[index] = color;

            transport.sendMessage({
                action: RequestAction.Put,
                path: `/input/${input.id}`,
                values: update
            });
        };

        return (
            <input key={index} type="color" value={`#${r}${g}${b}`} onChange={onChange} />
        )
    });

    return (
        <div className="input color">
            <div className="header">{input.name}</div>
            {inputs}
        </div>
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
        case DataType.Float4:
            return <InputColor {...(input as IInputWithValues<Float4>)} />;
        default:
            console.log('unknown type', input);
            return (null);
    }
}

export default Input;

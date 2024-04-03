import IInputGroup from './IInputGroup.d';
import IInput from './IInput';
import Input from './Input';
import './InputGroup.css';

interface InputGroupProps {
    group: IInputGroup
}

const InputGroup: React.FC<InputGroupProps> = ({ group }) => {
    return (
        <div className="input_group">
            <div className="title">{group.name}</div>
            {group.inputs.map((input: IInput) =>
                <Input key={input.id} {...input} />
            )}
        </div>
    );
}

export default InputGroup;

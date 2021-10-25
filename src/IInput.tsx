/**
 *  Are we a 'signal' input (which maintains
 *  values) or event-based (which can be triggered)
 */
export const enum Flow {
    signal = "signal",
    event = "event"
};

/**
 *  The data type usde by the input
 */
export const enum DataType {
    Trigger = "trigger",
    Float = "float",
    Integer = "int",
    Boolean = "bool",
    Float4 = "float_4",
    String = "string"
};

/**
 *  The properties all inputs have
 */
interface IInput {
    id: number,
    name: string,
    semantic: string,
    flow: Flow
    datatype: DataType,
    instance_count: number
};

/**
 *  Inputs may contain values and/or a
 *  min and max value
 */
export interface IInputWithValues<ValueType> extends IInput {
    min: ValueType | undefined,
    max: ValueType | undefined,
    values: ValueType[]
};

export default IInput;

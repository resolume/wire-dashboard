/**
 *  The response types we can receive from
 *  the server. Some of these may be sent
 *  without a previous request
 */
const enum ResponseType {
    GetPatch = "get_patch",
    GetInputIds = "get_input_ids",
    GetInputs = "get_inputs",
    GetInput = "get_input",
    UpdateInput = "update_input",
    InputSubscribed = "input_subscribed",
    InputUnsubscribed = "input_unsubscribed",
    InputTriggered = "input_triggered",
    InputAdded = "input_added",
    InputRemoved = "input_removed",
    InputsReordered = "inputs_reordered",
    InputGroupAdded = "input_group_added",
    InputGroupRemoved = "input_group_removed",
    InputGroupRenamed = "input_group_renamed",
    Error = "error"
};

export default ResponseType;

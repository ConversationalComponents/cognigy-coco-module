import uuid = require("uuid/v4");

const sdk = require("@aleximp/coco-sdk-nodejs");

type CocoResponse = {
    response: string;
    component_done: boolean;
    component_failed: boolean;
    updated_context: {[key: string]: any};
    confidence: number;
    idontknow: boolean;
    raw_resp: {[key: string]: any};
};

/**
 * Chats with CoCo
 * @arg {CognigyScript} `component` name of the component
 * @arg {CognigyScript} `stageId` stage id, defaults to component id - will be pushed into context.completed when finished
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function CoCo(
    input: IFlowInput,
    args: {component: string; stageId: string; stopOnError: boolean}
): Promise<IFlowInput | {}> {
    if (!args.component) {
        throw new Error("No component provided");
    }
    const component = args.component;
    const stageId = args.stageId || component;

    const text = input.input.text;
    if (!text) throw new Error("No text");
    const store = "coco";
    const context = input.context.getFullContext()[store] || {};
    if (!context.completed) context.completed = {};
    if (!context.failed) context.failed = {};
    const session_id = context.session_id || uuid();
    const conv = new sdk(component, session_id);
    context.session_id = session_id;
    input.context.getFullContext()[store] = context;

    return new Promise((resolve, reject) => {
        let result = {};

        conv.call(text, context.updated_context)
            .then(reply => {
                if (reply as CocoResponse) {
                    result = reply.response;
                    if (reply.component_done) {
                        context.session_id = uuid();
                        context.completed[stageId] = true;
                        if (reply.component_failed) {
                            context.failed[stageId] = true;
                        }
                    }
                }
                if (!context.last) {
                    context.last = {};
                }
                context.last.result = {...reply, raw_resp: undefined};
                context.updated_context = {...context.updated_context, ...reply.updated_context};
                input.context.getFullContext()[store] = context;
                input.actions.output(reply.response, context.result);
                if (reply && reply.response && reply.component_done) {
                    input.actions.output("Great! Shall we continue, then?", {});
                }
                return result;
            })
            .catch(err => {
                if (args.stopOnError) {
                    reject(err.message);
                    return null;
                } else result = {error: err.message};
                return result;
            })
            .then(x => {
                if (x) {
                    input.input[store] = result;
                    resolve(input);
                }
            });
    });
}

module.exports.CoCo = CoCo;

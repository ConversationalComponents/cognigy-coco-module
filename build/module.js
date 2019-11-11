"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v4");
const coco_1 = require("./coco");
/**
 * Chats with CoCo
 * @arg {CognigyScript} `component` name of the component
 * @arg {CognigyScript} `developerKey` optional developer API key
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function CoCo(input, args) {
    if (!args.component) {
        throw new Error("No component provided");
    }
    if (!args.developerKey) {
        throw new Error("No developerKey provided");
    }
    const component = args.component;
    const stageId = component;
    const text = input.input.text;
    if (!text)
        throw new Error("No text");
    const store = "coco";
    const context = input.context.getFullContext()[store] || {};
    if (!context.completed)
        context.completed = {};
    if (!context.failed)
        context.failed = {};
    const session_id = context.session_id || uuid();
    const conv = new coco_1.ComponentSession({ component_id: component, developer_key: args.developerKey, session_id });
    context.session_id = session_id;
    input.context.getFullContext()[store] = context;
    return new Promise((resolve, reject) => {
        let result = {};
        conv.call(text, context.updated_context)
            .then(reply => {
            if (reply instanceof Error)
                throw reply;
            result = reply.response;
            if (reply.component_done) {
                context.session_id = uuid();
                context.completed[stageId] = true;
                if (reply.component_failed) {
                    context.failed[stageId] = true;
                }
            }
            if (!context[stageId])
                context[stageId] = {};
            context[stageId].result = Object.assign(Object.assign({}, reply), { raw_resp: undefined });
            context.updated_context = Object.assign(Object.assign({}, context.updated_context), reply.updated_context);
            input.context.getFullContext()[store] = context;
            input.actions.output(reply.response, context.result);
            return result;
        })
            .catch(err => {
            if (args.stopOnError) {
                reject(err.message);
                return null;
            }
            else
                result = { error: err.message };
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
//# sourceMappingURL=module.js.map
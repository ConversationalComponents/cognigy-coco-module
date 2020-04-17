import uuid = require("uuid/v4");
import {ComponentSession} from "./coco";

/**
 * Chats with CoCo
 * @arg {String} `component` name of the component
 * @arg {String} `developerKey` optional developer API key
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 * @arg {String} `source_language_code` optional language code
 * @arg {String} `bot_name` optional bot name. If this is left empty and context or coco.context has bot_name, this field will be filled from context or context.coco respectively.
 */
async function CoCo(
    input: IFlowInput,
    args: {
        component: string;
        developerKey: string;
        stopOnError: boolean;
        source_language_code: string;
        bot_name: string;
    }
) {
    if (!args.component) {
        throw new Error("No component provided");
    }
    if (!args.developerKey) {
        throw new Error("No developerKey provided");
    }
    const component = args.component;
    const stageId = component;

    const text = input.input.text;
    if (!text) throw new Error("No text");
    const store = "coco";
    const rawContext = input.context.getFullContext() || {};
    const context = {...rawContext[store]} || {};
    const botName = args.bot_name || context.bot_name || rawContext.bot_name || "";
    rawContext.bot_name = botName;
    if (!context.completed) context.completed = {};
    if (!context.failed) context.failed = {};
    if (!context.updated_context) context.updated_context = {};
    const session_id = context.session_id || uuid();
    context.updated_context.bot_name = botName;
    const conv = new ComponentSession({component_id: component, developer_key: args.developerKey, session_id});
    context.session_id = session_id;
    input.actions.addToContext(store, context, "simple");

    const reply = await conv.call(text, context.updated_context, args.source_language_code);
    if (reply instanceof Error) throw reply;

    if (reply.component_done) {
        context.session_id = uuid();
        context.completed[stageId] = true;
        if (reply.component_failed) {
            context.failed[stageId] = true;
        }
    }
    if (!context[stageId]) context[stageId] = {};
    context[stageId].result = {...reply, raw_resp: undefined};
    context.updated_context = {...context.updated_context, ...reply.updated_context};
    input.actions.addToContext(store, context, "simple");
    input.actions.output(reply.response, context.result);

    return input;
}
module.exports.CoCo = CoCo;

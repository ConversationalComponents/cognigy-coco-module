import uuid = require("uuid/v4");
import * as rp from "request-promise";

export type CocoResponse = {
    response: string;
    component_done: boolean;
    component_failed: boolean;
    updated_context: {[key: string]: any};
    confidence: number;
    idontknow: boolean;
    raw_resp: {[key: string]: any};
};

export class ComponentSession {
    private component_id = "";
    private session_id = "";
    private developer_key = "";

    constructor(p: {component_id: string; developer_key?: string; session_id?: string}) {
        this.component_id = p.component_id;
        this.session_id = p.session_id || uuid();
        this.developer_key = p.developer_key || "trial";
    }

    reset(session_id: string = uuid()) {
        this.session_id = session_id;
    }

    call(user_input?: string, context?: any, source_language_code?: string) {
        return new Promise<CocoResponse | Error>((resolve, reject) => {
            const payload = {} as any;
            user_input && (payload.user_input = user_input);
            context && (payload.context = context);
            source_language_code && (payload.source_language_code = source_language_code);
            rp(
                {
                    method: "POST",
                    url: `https://cocohub.ai/api/exchange/${this.component_id}/${this.session_id}`,
                    body: JSON.stringify(payload),
                    headers: {"api-key": this.developer_key}
                },
                function(error, response, body) {
                    if (response.statusCode !== 200) {
                        reject(new Error(response.body));
                    }
                    if (error) {
                        reject(error as Error);
                        return;
                    }
                    try {
                        const bodyJson = JSON.parse(body);
                        resolve({...bodyJson, raw_resp: response} as CocoResponse);
                    } catch (e) {
                        reject(e as Error);
                    }
                }
            );
        });
    }
}

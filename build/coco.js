"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v4");
const rp = require("request-promise");
class ComponentSession {
    constructor(p) {
        this.component_id = "";
        this.session_id = "";
        this.developer_key = "";
        this.component_id = p.component_id;
        this.session_id = p.session_id || uuid();
        this.developer_key = p.developer_key || "trial";
    }
    reset(session_id = uuid()) {
        this.session_id = session_id;
    }
    call(user_input, context) {
        return new Promise((resolve, reject) => {
            const payload = {};
            user_input && (payload.user_input = user_input);
            context && (payload.context = context);
            rp({
                method: "POST",
                url: `https://marketplace.conversationalcomponents.com/api/exchange/${this.component_id}/${this.session_id}`,
                body: JSON.stringify(payload),
                headers: { "api-key": this.developer_key }
            }, function (error, response, body) {
                if (response.statusCode !== 200) {
                    reject(new Error(response.body));
                }
                if (error) {
                    reject(error);
                    return;
                }
                try {
                    const bodyJson = JSON.parse(body);
                    resolve(Object.assign(Object.assign({}, bodyJson), { raw_resp: response }));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
}
exports.ComponentSession = ComponentSession;
//# sourceMappingURL=coco.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor() {
        this.cached = {};
    }
    get(request) {
        return this.cached[request.UID];
    }
    upsert(request, response) {
        this.cached[request.UID] = response;
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map
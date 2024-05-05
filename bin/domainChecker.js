"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainChecker = void 0;
class DomainChecker {
    constructor() {
        this.blackList = ["youtube", "googlevideo", "roblox", "classroom6x", "tiktok", "unity", "snapchat", "goguardian", "-tiktok", "unity3d", "classroom6x", "goguardian", "classroom6x", "tiktokcdn", "facebook", "brawlstars", "tiktokcdn-eu", "tiktokv", "apple", "aaplimg", "brawlstargame", "brawlstarsgame", "brawlstars", "vungle", "gameduo", "liftoff", "applovin", "inner-activ", "inmobicdn", "inmobi", "applvn", "tiktokcdn-us", "stats", "ocsp", "supercell", "rbxcdn", "crazygames", "epicgames", "epicgames", "yohoho", "poki", "1001games", "friv", "numuki", "coolmathgames", "raft-wars", "ytimg", "fbcdn", "brawlstars", "snapchat"];
    }
    isAllowed(hostAddress, fullDomain) {
        return false;
        return this.blackList.indexOf(fullDomain) != -1;
    }
}
exports.DomainChecker = DomainChecker;
//# sourceMappingURL=domainChecker.js.map
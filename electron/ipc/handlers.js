import {registerMainHandlers} from "./mainHandlers.js";
import {registerCgmHandlers} from "./cgmHandlers.js";
import {registerStoreHandlers} from "./storeHandlers.js";
import {registerCommonHandlers} from "./commonHandlers.js";
import {registerVimeoHandlers} from "./vimeoHandlers.js";
import {registerTimelineHandlers} from "./timelineHandlers.js";

export const registerIpcHandlers = () => {
    registerMainHandlers();
    registerCgmHandlers();
    registerVimeoHandlers();
    registerTimelineHandlers();

    registerStoreHandlers();
    registerCommonHandlers();
};

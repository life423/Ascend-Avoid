export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
const levelOrder = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3
};
const currentLevel = process.env.LOG_LEVEL || LogLevel.INFO;
function shouldLog(level) {
    return levelOrder[level] <= levelOrder[currentLevel];
}
function prefix() {
    return `[${new Date().toISOString()}]`;
}
export const logger = {
    error: (...args) => {
        if (shouldLog(LogLevel.ERROR))
            console.error(prefix(), ...args);
    },
    warn: (...args) => {
        if (shouldLog(LogLevel.WARN))
            console.warn(prefix(), ...args);
    },
    info: (...args) => {
        if (shouldLog(LogLevel.INFO))
            console.log(prefix(), ...args);
    },
    debug: (...args) => {
        if (shouldLog(LogLevel.DEBUG))
            console.debug(prefix(), ...args);
    }
};
export default logger;
//# sourceMappingURL=logger.js.map
module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for reanimated (if added later) and other expo plugins
        ],
    };
};

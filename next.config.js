/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [],
    },
    // Configure webpack for path aliases
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,

            '@': require('path').resolve(__dirname, './src'),
        };
        return config;
    },
};

module.exports = nextConfig;

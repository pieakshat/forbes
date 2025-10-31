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
    // Configure API routes for file uploads
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};

module.exports = nextConfig;

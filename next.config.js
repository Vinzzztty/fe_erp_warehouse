module.exports = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination:
                    "https://backend-erp-warehouse.vercel.app/api/v1/:path*", // Your backend service URL
            },
        ];
    },
};

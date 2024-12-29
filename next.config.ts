import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination:
                    "https://backend-erp-warehouse.vercel.app/api/v1/:path*",
            },
        ];
    },
};

export default nextConfig;

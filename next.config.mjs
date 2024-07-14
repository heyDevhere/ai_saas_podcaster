/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript:{
      ignoreBuildErrors: true,
    },
    images:{
        remotePatterns:[
            {
                protocol:'https',
                hostname:"lovely-flamingo-139.convex.cloud"
            },
            {
                protocol:'https',
                hostname:"jovial-ferret-76.convex.cloud"
            },
            {
                protocol:'https',
                hostname:"images.pexels.com"
            },
            // as we are trying to render our own profile name , at hte podcastdetails page upper section!
            {
                protocol:'https',
                hostname:"img.clerk.com"
            }
            
        ]
    }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so stray lockfiles outside the project
  // (e.g. C:\Users\<user>\package-lock.json) don't confuse Turbopack.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    // Optimization enabled: Vercel serves AVIF/WebP at correct sizes.
    // `sharp` is installed so local production builds work too.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

export default nextConfig

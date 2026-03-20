import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="zh">
      <body className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center px-6 py-20 max-w-md mx-auto relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-mint/[0.08] rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-brand-taro/[0.06] rounded-full blur-[80px]" />
          </div>

          {/* Cat animation */}
          <div className="relative mb-8">
            <div className="text-8xl sm:text-9xl animate-bounce" style={{ animationDuration: '2s' }}>
              🐱
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-white/5 rounded-full blur-sm" />
          </div>

          {/* Error text */}
          <h1 className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-200 mb-2">
            この猫がページを隠しちゃった
          </h2>
          <p className="text-gray-400 mb-2">
            这只猫把页面藏起来了 🐾
          </p>
          <p className="text-sm text-gray-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Actions - glass style */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-mint/15 text-brand-mint font-medium text-sm hover:bg-brand-mint/25 transition-colors border border-brand-mint/20 shadow-[0_0_20px_rgba(94,234,212,0.15)]"
            >
              🏠 回到首页
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/5 transition-colors backdrop-blur-sm"
            >
              📝 去看博客
            </Link>
          </div>

          {/* Paw prints decoration */}
          <div className="mt-12 flex justify-center gap-3 text-gray-700">
            <span className="text-lg">🐾</span>
            <span className="text-sm mt-2">🐾</span>
            <span className="text-xs mt-3">🐾</span>
          </div>
        </div>
      </body>
    </html>
  );
}

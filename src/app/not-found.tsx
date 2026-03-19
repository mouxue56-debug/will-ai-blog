import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="zh">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center px-6 py-20 max-w-md mx-auto">
          {/* Cat animation */}
          <div className="relative mb-8">
            <div className="text-8xl sm:text-9xl animate-bounce" style={{ animationDuration: '2s' }}>
              🐱
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/5 dark:bg-white/5 rounded-full blur-sm" />
          </div>

          {/* Error text */}
          <h1 className="text-6xl sm:text-7xl font-bold text-gray-200 dark:text-gray-800 mb-4">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            この猫がページを隠しちゃった
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            这只猫把页面藏起来了 🐾
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#4ADE80] text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-md shadow-[#4ADE80]/20"
            >
              🏠 回到首页
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              📝 去看博客
            </Link>
          </div>

          {/* Paw prints decoration */}
          <div className="mt-12 flex justify-center gap-3 text-gray-200 dark:text-gray-800">
            <span className="text-lg">🐾</span>
            <span className="text-sm mt-2">🐾</span>
            <span className="text-xs mt-3">🐾</span>
          </div>
        </div>
      </body>
    </html>
  );
}

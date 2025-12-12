/**
 * Mascot Section Component
 * 
 * Placeholder for your app mascot or character illustration.
 * Replace the placeholder with your actual mascot image.
 */
export function Mascot() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Mascot Illustration */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Placeholder for mascot - replace with your image */}
              <div className="w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">🎨</div>
                  <p className="text-white/80 text-lg font-medium">
                    Your Mascot Here
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    Replace with your app mascot image
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-pink-400 rounded-full animate-ping" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Meet Your New Best Friend
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Our friendly mascot is here to guide you through your journey.
              From getting started to mastering advanced features, you'll never
              feel alone on this adventure.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  ✨
                </span>
                <span className="text-white">Always there to help</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  💡
                </span>
                <span className="text-white">Smart tips and suggestions</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  🎯
                </span>
                <span className="text-white">Helps you stay on track</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

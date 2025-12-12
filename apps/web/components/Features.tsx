import { Zap, Shield, Sparkles, Clock, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Experience blazing fast performance with our optimized architecture that keeps up with your pace.',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description:
      'Your data is protected with enterprise-grade security and end-to-end encryption.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description:
      'Leverage cutting-edge AI to automate tasks and get intelligent recommendations.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description:
      'Automate repetitive tasks and focus on what matters most to you.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'Work seamlessly with your team with real-time sync and sharing features.',
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description:
      'Get insights into your progress with detailed analytics and reports.',
  },
];

/**
 * Features Section Component
 * Displays key app features in a grid
 */
export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600">
            Arc comes packed with powerful features designed to help you succeed
            in everything you do.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

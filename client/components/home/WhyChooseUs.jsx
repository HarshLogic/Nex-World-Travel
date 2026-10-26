import { MessageSquareText, Shield, Award, Users, CheckCircle, Sparkles } from 'lucide-react';

const VALUE_PROPS = [
  {
    icon: MessageSquareText,
    title: 'Communications Expertise',
    description:
      'We listen first. Our consultants communicate with clarity, swift responsiveness, and multilingual support from the initial idea until your safe return home.',
  },
  {
    icon: Award,
    title: 'Solid Industry Experience',
    description:
      'Backed by veteran travel architects and our affiliate network Club Nexa (established in 2015), providing seasoned destination insights and privileged supplier relationships.',
  },
  {
    icon: Users,
    title: 'Professional Team',
    description:
      'Certified specialists who curate balanced itineraries tailored to your style—whether high-adrenaline adventure, romantic indulgence, or family harmony.',
  },
  {
    icon: Shield,
    title: 'Headquartered in Abu Dhabi',
    description:
      'Officially licensed travel agency situated at Bin Hamooda Tower, Abu Dhabi. Proud official travel partner for marquee corporate and community events.',
  },
];

const METRICS = [
  { label: 'Founded in Abu Dhabi', value: '2024', highlight: 'HQ in UAE' },
  { label: 'Affiliate Network (Club Nexa)', value: '2015', highlight: 'Established' },
  { label: 'Global Regions Curated', value: '5+', highlight: 'Asia, Europe, Africa, Australia, UAE' },
  { label: 'Tailored Itineraries', value: '100%', highlight: 'Zero Generic Templates' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-surface-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Choose Nex World Travel</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Built on Trust, Modern Technology & Personal Care
          </h2>
          <p className="text-text-secondary text-base mt-3 leading-relaxed">
            We reimagined modern leisure and corporate travel planning to be transparent, responsive, and tailored around what matters to you.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div
                key={prop.title}
                className="bg-white rounded-3xl p-7 border border-border hover:border-accent-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-primary-light text-accent-primary flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2.5">
                  {prop.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Verified Metrics Counter Row */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {METRICS.map((metric) => (
              <div key={metric.label} className="text-center p-3 rounded-2xl bg-surface-50/60 lg:bg-transparent">
                <div className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-1">
                  {metric.value}
                </div>
                <div className="text-xs font-semibold text-text-primary mb-0.5">
                  {metric.label}
                </div>
                <div className="text-[11px] text-accent-primary font-medium">
                  {metric.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


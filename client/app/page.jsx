import HeroSection from '../components/home/HeroSection';
import FeaturedDestinations from '../components/home/FeaturedDestinations';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ExperiencesSection from '../components/home/ExperiencesSection';
import PartnersSection from '../components/home/PartnersSection';
import CallToAction from '../components/home/CallToAction';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedDestinations />
      <ServicesSection />
      <WhyChooseUs />
      <ExperiencesSection />
      <PartnersSection />
      <CallToAction />
    </>
  );
}


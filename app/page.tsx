import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Comparison from "./components/Comparison";
import UseCases from "./components/UseCases";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <Comparison />
      <UseCases />
      <CTA />
      <Footer />
    </div>
  );
}

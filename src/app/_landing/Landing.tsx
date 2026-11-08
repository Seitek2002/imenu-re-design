import Calculator from './Calculator';
import Contact from './Contact';
import Faq from './Faq';
import Features from './Features';
import Footer from './Footer';
import Hero from './Hero';
import Journey from './Journey';
import Launch from './Launch';
import Manifesto from './Manifesto';
import Nav from './Nav';
import ScrollFx from './ScrollFx';
import Terms from './Terms';
import { landingMono, landingSans } from './fonts';

import './landing.css';

export default function Landing() {
  return (
    <div className={`lp ${landingSans.variable} ${landingMono.variable}`} data-lp-root>
      <a href='#main' className='lp-skip'>
        Перейти к содержанию
      </a>
      <Nav />
      <main id='main'>
        <Hero />
        <Manifesto />
        <Calculator />
        <Features />
        <Journey />
        <Terms />
        <Launch />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <ScrollFx />
    </div>
  );
}

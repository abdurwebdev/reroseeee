import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import gsap from 'gsap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import custom components
import Hero3D from '../components/landing/Hero3D';
import Marquee from '../components/landing/Marquee';
import HorizontalScroll from '../components/landing/HorizontalScroll';
import ParallaxSection from '../components/landing/ParallaxSection';
import CaseStudy from '../components/landing/CaseStudy';
import PerformanceStats from '../components/landing/PerformanceStats';

const Landing = () => {
  const [activeAccordion, setActiveAccordion] = useState(0);
  const { scrollYProgress } = useScroll();
  const featuresRef = useRef(null);

  // Mouse follower effect
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  // Features data
  const features = [
    {
      title: "High Performance Streaming",
      description: "Optimized video delivery with adaptive bitrate streaming that works flawlessly even with billions of concurrent users.",
      icon: "🚀",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Interactive Live Courses",
      description: "Engage with instructors in real-time with our low-latency streaming technology.",
      icon: "🎓",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Personalized Learning Path",
      description: "AI-powered recommendations to customize your educational journey.",
      icon: "🧠",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Community Collaboration",
      description: "Connect with peers, share insights, and collaborate on projects.",
      icon: "👥",
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Global Scale Infrastructure",
      description: "Built on a distributed architecture that can handle billions of users without performance degradation.",
      icon: "🌐",
      color: "from-red-500 to-rose-500"
    },
    {
      title: "Advanced Analytics",
      description: "Gain insights into your learning patterns and progress with detailed analytics.",
      icon: "📊",
      color: "from-indigo-500 to-violet-500"
    }
  ];

  // Client logos
  const clientLogos = [
    <img src="/assets/logos/logo1.svg" alt="Client 1" className="h-12" />,
    <img src="/assets/logos/logo2.svg" alt="Client 2" className="h-12" />,
    <img src="/assets/logos/logo3.svg" alt="Client 3" className="h-12" />,
    <img src="/assets/logos/logo4.svg" alt="Client 4" className="h-12" />,
    <img src="/assets/logos/logo5.svg" alt="Client 5" className="h-12" />
  ];

  // Case studies data
  const caseStudies = [
    {
      title: "Educational Platform Scaling",
      description: "How we helped an educational platform scale to support 10 million concurrent users.",
      image: "/assets/case-studies/placeholder1.svg",
      category: "Infrastructure",
      link: "#"
    },
    {
      title: "Video Streaming Optimization",
      description: "Reducing buffering by 95% while maintaining high video quality.",
      image: "/assets/case-studies/placeholder2.svg",
      category: "Performance",
      link: "#"
    },
    {
      title: "Interactive Learning Experience",
      description: "Creating an immersive learning environment with real-time collaboration.",
      image: "/assets/case-studies/placeholder3.svg",
      category: "User Experience",
      link: "#"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      text: "This platform transformed how I approach continuous learning. The video quality is exceptional even on my slow connection, and I've never experienced any downtime despite millions of concurrent users.",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Data Scientist at Microsoft",
      text: "I've tried many learning platforms, but none match the performance and user experience here. The ability to handle billions of users without any lag is truly impressive.",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
      rating: 5
    },
    {
      name: "Aisha Patel",
      role: "UX Designer at Apple",
      text: "The interactive features and smooth video playback make this my go-to platform for design courses. Even during peak hours with millions of users, the platform remains responsive and reliable.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Product Manager at Amazon",
      text: "The scalability of this platform is unmatched. We've used it for company-wide training with thousands of employees simultaneously without any issues.",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "CTO at Startup Inc.",
      text: "As someone who manages large-scale systems, I'm impressed by how this platform handles billions of users without compromising on quality or performance.",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 5
    }
  ];

  // Performance stats
  const performanceStats = [
    {
      value: 10,
      suffix: "B+",
      label: "Active Users",
      color: "text-blue-500"
    },
    {
      value: 99.999,
      suffix: "%",
      label: "Uptime",
      color: "text-green-500"
    },
    {
      value: 0.1,
      suffix: "s",
      label: "Avg. Load Time",
      color: "text-purple-500"
    },
    {
      value: 24,
      suffix: "/7",
      label: "Support",
      color: "text-yellow-500"
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does the platform handle billions of users?",
      answer: "We use a globally distributed CDN architecture with edge caching, adaptive streaming, and microservices that automatically scale based on demand. Our infrastructure is designed to handle sudden traffic spikes and maintain performance even with billions of concurrent users."
    },
    {
      question: "What makes your video streaming different?",
      answer: "Our proprietary compression algorithm and adaptive bitrate technology optimize video delivery based on your connection, ensuring buffer-free playback. We also use predictive preloading and edge computing to minimize latency and provide a seamless experience regardless of user load."
    },
    {
      question: "Can I access content offline?",
      answer: "Yes, premium users can download videos for offline viewing through our mobile apps. Our advanced syncing technology ensures that your progress is updated when you reconnect, even if you've watched content offline."
    },
    {
      question: "How do you ensure content quality?",
      answer: "All courses undergo a rigorous review process by industry experts before publication. We also use AI-powered quality assessment tools to ensure video and audio clarity meet our high standards."
    },
    {
      question: "What security measures do you have in place?",
      answer: "We implement end-to-end encryption, multi-factor authentication, and regular security audits. Our platform is compliant with GDPR, CCPA, and other global privacy regulations to ensure your data remains secure."
    },
    {
      question: "How do you handle peak traffic periods?",
      answer: "Our elastic infrastructure automatically scales to accommodate traffic spikes. We use predictive analytics to anticipate high-demand periods and pre-allocate resources accordingly, ensuring consistent performance even during global events."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Custom cursor follower */}
      <motion.div
        ref={cursorRef}
        className="fixed w-6 h-6 rounded-full bg-blue-500 bg-opacity-50 pointer-events-none z-50 hidden md:block"
        style={{
          x: 0,
          y: 0,
          mixBlendMode: 'difference'
        }}
      />

      <Navbar />

      {/* Hero Section with 3D effect */}
      <Hero3D
        title="Redefining Online Learning"
        subtitle="Experience lightning-fast video streaming and interactive courses that scale to billions of users without compromise."
        backgroundVideo="/assets/hero-background.mp4"
        primaryButtonText="Explore Courses"
        primaryButtonLink="/feed"
        secondaryButtonText="Join Now"
        secondaryButtonLink="/register"
      />

      {/* Trusted by section with marquee */}
      <section className="py-12 bg-black border-t border-b border-gray-800">
        <div className="container mx-auto px-6">
          <h3 className="text-center text-gray-400 mb-8 text-sm uppercase tracking-wider">Trusted by industry leaders</h3>
          <Marquee items={clientLogos} speed={15} />
        </div>
      </section>

      {/* Features Section with Horizontal Scroll */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900" ref={featuresRef}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-bold mb-4"
            >
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Billions</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Our platform combines performance with innovation to deliver an unmatched learning experience that scales effortlessly
            </motion.p>
          </div>

          <HorizontalScroll className="py-10 mb-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="min-w-[300px] md:min-w-[400px] mr-8 last:mr-0"
              >
                <div className={`bg-gray-800 rounded-xl p-8 h-full border-t-4 border-transparent hover:border-t-4 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2`}>
                  <div className={`text-4xl mb-6 bg-gradient-to-br ${feature.color} inline-block p-4 rounded-lg`}>{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </HorizontalScroll>
        </div>
      </section>

      {/* Performance Stats Section */}
      <ParallaxSection
        className="py-24"
        backgroundImage="/assets/case-studies/placeholder1.svg"
        overlayOpacity={0.85}
      >
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-16 text-center"
          >
            Unmatched <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Performance</span>
          </motion.h2>

          <PerformanceStats stats={performanceStats} />
        </div>
      </ParallaxSection>

      {/* Case Studies Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-blue-500 uppercase tracking-wider font-medium"
            >
              Case Studies
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold mt-2 mb-4"
            >
              Success Stories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              See how our platform has helped organizations scale their educational content to billions of users
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <CaseStudy
                key={index}
                title={study.title}
                description={study.description}
                image={study.image}
                category={study.category}
                link={study.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-16 text-center"
          >
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Users</span> Say
          </motion.h2>

          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: false,
            }}
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 2.5 }
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="testimonial-swiper"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 h-full shadow-xl"
                >
                  {/* Rating stars */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-300 italic text-lg mb-6">"{testimonial.text}"</p>

                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-16 text-center"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Questions</span>
          </motion.h2>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  className={`w-full text-left p-6 rounded-lg flex justify-between items-center ${activeAccordion === index ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gray-900'
                    } transition-all duration-300`}
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeAccordion === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </motion.div>
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: activeAccordion === index ? 'auto' : 0,
                    opacity: activeAccordion === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-800 rounded-b-lg">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ParallaxSection
        className="py-24"
        backgroundVideo="/assets/hero-background.mp4"
        overlayOpacity={0.7}
        speed={0.1}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-6"
          >
            Ready to Transform Your Learning?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-10 max-w-3xl mx-auto"
          >
            Join billions of learners worldwide on our high-performance platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/register" className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-block">
              Get Started For Free
            </Link>
          </motion.div>
        </div>
      </ParallaxSection>

      <Footer />
    </div>
  );
};

export default Landing;
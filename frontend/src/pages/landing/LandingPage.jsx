import { Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Testimonials from "./Testimonials";
import FeaturedModules from "./FeaturedModules";
import Navbar from "./Navbar";
import Hero from "./Hero";
import CTA from "./CTA";
import Footer from "./Footer";

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      position="relative"
      overflow="hidden"
      minH="100vh"
      display="flex"
      flexDirection="column"
      sx={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge legacy
        "&::-webkit-scrollbar": {
          display: "none", // Chrome, Safari
        },
      }}
    >
      <Navbar />
      {/* Scroll Progress Bar */}
      <Box
        position="fixed"
        top={16}
        left={0}
        width={`${scrollProgress}%`}
        height="5px"
        bg="yellow.400"
        zIndex={50}
        transition="width 0.3s ease-out"
      />

      {/* Hero Section */}
      <Hero />

      {/* Featured Modules */}
      <FeaturedModules />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Call-to-Action */}
      <CTA />

      {/* Footer */}

      <Footer />
    </Box>
  );
};

export default LandingPage;

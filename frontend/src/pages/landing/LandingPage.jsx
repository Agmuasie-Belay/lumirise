import { Box } from "@chakra-ui/react";
import { useEffect, useRef, lazy, Suspense } from "react";
import Navbar from "./Navbar";

const Hero = lazy(() => import("./Hero"));
const FeaturedModules = lazy(() => import("./FeaturedModules"));
const Testimonials = lazy(() => import("./Testimonials"));
const CTA = lazy(() => import("./CTA"));
const Footer = lazy(() => import("./Footer"));

const LandingPage = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <Box
      position="relative"
      minH="0"
      display="flex"
      flexDirection="column"
      bg="#F4F8F9"
      sx={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Navbar />

      {/* Scroll Progress Bar */}
      <Box
        ref={progressRef}
        position="fixed"
        top="60px"
        left={0}
        height="4px"
        bgGradient="linear(to-r, #a8ab00, #f2ff00)"
        zIndex={9999}
        width="0%"
        transition="width 0.2s ease-out"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <Hero />
        <FeaturedModules />
        <Testimonials />
        <CTA />
        <Footer />
      </Suspense>
    </Box>
  );
};

export default LandingPage;
import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  Button,
} from "@chakra-ui/react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const MotionBox = motion(Box);

export default function FeaturedModules({ modules }) {
  const sliderRef = useRef(null);
  useEffect(() => {
    const updateSlider = () => {
      sliderRef.current?.slickGoTo(0, true); 
      sliderRef.current?.slickSetPosition(); 
    };
    const timeout = setTimeout(updateSlider, 100);
    window.addEventListener("resize", updateSlider);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateSlider);
    };
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
    centerMode: false,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <Box py={{ base: 10, md: 20 }} bg="gray.50" w="full" overflow="hidden">
      <Container maxW="container.xl">
        <Heading
          textAlign="center"
          mb={10}
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="extrabold"
        >
          Featured Modules
        </Heading>

        <Slider {...sliderSettings} ref={sliderRef}>
          {modules.map((module) => (
            <Box key={module.id} px={{ base: 2, md: 4 }}>
              <MotionBox
                bg="white"
                p={{ base: 4, md: 6 }}
                rounded="md"
                shadow="md"
                mx="auto"
                w={{ base: "90%", sm: "80%", md: "100%" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <VStack spacing={3} align="start">
                  <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    {module.title}
                  </Heading>
                  <Text fontSize={{ base: "sm", md: "md" }}>{module.description}</Text>
                  <Link to="/modules">
                    <Button colorScheme="blue" mt="auto">
                      Explore Module
                    </Button>
                  </Link>
                </VStack>
              </MotionBox>
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
}

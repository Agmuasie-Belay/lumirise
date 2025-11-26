import { Box, Heading, Text, VStack, Avatar, HStack } from "@chakra-ui/react";
import Slider from "react-slick";

const Testimonials = () => {
  const testimonials = [
    {
      name: "John Doe",
      role: "Full Stack Developer",
      feedback:
        "LumiRise transformed my coding skills. The modules are clear, practical, and fun!",
    },
    {
      name: "Jane Smith",
      role: "Data Scientist",
      feedback:
        "The machine learning module gave me the confidence to build my first ML project.",
    },
    {
      name: "Ali Ibrahim",
      role: "Embedded Systems Engineer",
      feedback:
        "Hands-on projects made learning embedded systems enjoyable and effective.",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    centerMode: true,
    centerPadding: "0px",
  };

  return (
    <Box py={20} bg="gray.100" >
      <Heading textAlign="center" mb={12} fontSize="4xl">
        What Our Students Say
      </Heading>

      <Slider {...sliderSettings}>
        {testimonials.map((t, idx) => (
          <Box
            key={idx}
            display="flex"
            justifyItems="center" 
          >
            <Box
              p={8}
              bg="white"
              borderRadius="lg"
              shadow="md"
              maxW="2xl" 
              w="full" 
              textAlign="center"
            >
              <VStack spacing={4}>
                <Text fontSize="lg" fontStyle="italic">
                  "{t.feedback}"
                </Text>
                <HStack spacing={3} mt={4} justify="center">
                  <Avatar name={t.name} />
                  <VStack spacing={0} align="start">
                    <Text fontWeight="bold">{t.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {t.role}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default Testimonials;

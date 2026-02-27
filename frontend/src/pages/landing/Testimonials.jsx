import { Box, Heading, Text, VStack, Avatar, HStack } from "@chakra-ui/react";
import Slider from "react-slick";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Former Trainee",
      role: "Aspiring Data Analyst",
      feedback:
        "LumiRise's Digital Literacy training helped me confidently use Excel and Google Docs for my assignments and projects.",
    },
    {
      name: "Former Trainee",
      role: "Recent Graduate",
      feedback:
        "The Job Readiness sessions prepared me for interviews, CV writing, and workplace professionalism. I feel ready to enter the workforce.",
    },
    {
      name: "Former Trainee",
      role: "Junior Developer",
      feedback:
        "The Machine Learning course made complex concepts easy to understand, and the hands-on exercises gave me real coding experience.",
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
    <Box py={{ base: 10, md: 20 }}  bg="gray.100" position="relative" top="16">
      <Heading
        textAlign="center"
        mb={10}
        fontSize={{ base: "2xl", md: "4xl" }}
        fontWeight="extrabold"
      >
        Hear From Our Certified Graduates
      </Heading>
      <Slider {...sliderSettings}>
        {testimonials.map((t, idx) => (
          <Box key={idx} display="flex" justifyItems="center">
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

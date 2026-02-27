import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function FeaturedModules() {
  const modules = [
    {
      id: 1,
      title: "Digital Productivity Mastery",
      description:
        "Build essential digital skills to organize, create, and submit work like a professional.",
    },
    {
      id: 2,
      title: "Job Readiness Accelerator",
      description:
        "Craft standout CVs, ace interviews, and step confidently into your dream career.",
    },
    {
      id: 3,
      title: "Data Analytics for Impact",
      description:
        "Turn data into insights and make decisions that drive real-world results.",
    },
  ];
  return (
    <Box py={{ base: 10, md: 20 }} bg="gray.50" w="full" overflow="hidden" position="relative" top="16">
      <Container maxW="container.xl">
        <Heading
          textAlign="center"
          mb={10}
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="extrabold"
        >
          Featured Courses
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
          {modules.map((module) => (
            <Box
              key={module.id}
              bg="white"
              p={{ base: 4, md: 6 }}
              rounded="md"
              shadow="md"
            >
              <VStack spacing={3} align="start">
                <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  {module.title}
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }}>
                  {module.description}
                </Text>
                <Link to="/modules">
                  <Button colorScheme="blue" mt="auto">
                    Explore Module
                  </Button>
                </Link>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

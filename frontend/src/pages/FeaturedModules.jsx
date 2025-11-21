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

export default function FeaturedModules({ modules }) {
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

        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={{ base: 6, md: 8 }}
        >
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

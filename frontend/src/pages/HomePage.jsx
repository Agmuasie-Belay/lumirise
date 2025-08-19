import React, { use, useEffect } from "react";
import { useProductStore } from "../store/product";
import { SimpleGrid } from "@chakra-ui/react";
import ProductCard from "../components/ProductCard";
import { Container, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
const HomePage = () => {
  const { fetchProducts, products } = useProductStore();
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return (
    <Container maxW={"container.md"} py={8}>
      {products.length > 0 ? (
        <VStack spacing={4} align="center">
          <Text
            fontSize="30"
            fontWeight="bold"
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
            textAlign={"center"}
          >
            Current Products
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </SimpleGrid>
        </VStack>
      ) : (
        <Text
          fontSize="xl"
          textAlign={"center"}
          fontWeight={"bold"}
          color="gray.500"
        >
          No products available yet. Please create a new product.
          <Link to="/create">
            <Text
              as="span"
              color="blue.500"
              _hover={{ textDecoration: "underline" }}
            >
              Create a new product
            </Text>
          </Link>
        </Text>
      )}
    </Container>
  );
};

export default HomePage;

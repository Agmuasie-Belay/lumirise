import React from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { useProductStore } from "../store/product";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const {products} = useProductStore;
  return (
    <Container maxW={"940px"} px={4} py={2} mx="auto">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ base: "column", md: "row" }}
      >
        <Text
          fontSize={{ base: "22", sm: "28", md: "32" }}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          textAlign={"center"}
          bgGradient={"linear(to-r, cyan.400, blue.500)"}
          bgClip={"text"}
        >
          <Link to="/">Product Store</Link>
        </Text>
        <HStack alignItems={"center"} >
          <Link to="/create">
            <Button marginRight={2}>
              <PlusSquareIcon fontSize="20" />
            </Button>
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? (
                <IoMoon size="20" />
              ) : (
                <LuSun size="20" />
              )}
            </Button>
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;

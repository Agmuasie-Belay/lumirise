import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Flex,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

function Navbar() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const role = currentUser?.role || "visitor";


  return (
    <Container maxW={"940px"} px={4} py={2} mx="auto">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ base: "column", md: "row" }}
      >
        <Text
          fontSize={{ base: "20", sm: "26", md: "32" }}
          fontWeight={"bold"}
          textAlign={"center"}
          bgGradient={"linear(to-r, blue.400, blue.600)"}
          bgClip={"text"}
        >
          <Link
            to={
              !currentUser
                ? "/" 
                : currentUser.role === "student"
                ? "/student-home"
                : currentUser.role === "tutor"
                ? "/tutor-home"
                : currentUser.role === "admin"
                ? "/admin-home"
                : "/" 
            }
          >
            LumiRise
          </Link>
        </Text>
        
      </Flex>
    </Container>
  );
}

export default Navbar;

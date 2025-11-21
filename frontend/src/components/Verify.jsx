import {
  Container,
  Heading,
  Box,
  VStack,
  Input,
  Button,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const VerifyPage = () => {
  const [code, setCode] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyAccount } = useAuthStore();

  // get data passed from signup
  const { userId, email, phone } = location.state || {};

  const handleVerify = async () => {
    if (!code) {
      toast({
        title: "Code required",
        description: "Please enter the 6-digit verification code.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { success, message } = await verifyAccount({ userId, code });

    if (success) {
      toast({
        title: "Verified",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    } else {
      toast({
        title: "Verification failed",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm">
      <VStack spacing={8}>
        <Heading as="h1" size="xl" textAlign="center" mt={6}>
          Verify Your Account
        </Heading>

        <Box
          w="80%"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded="lg"
          shadow="md"
        >
          <VStack spacing={4}>
            <Text fontSize="md" textAlign="center">
              We’ve sent a 6-digit verification code to{" "}
              <strong>{email || phone}</strong>.  
              Please enter it below to complete your registration.
            </Text>

            <Input
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />

            <Button colorScheme="blue" w="full" onClick={handleVerify}>
              Verify
            </Button>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Didn’t get the code? Check your spam folder or contact support.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default VerifyPage;

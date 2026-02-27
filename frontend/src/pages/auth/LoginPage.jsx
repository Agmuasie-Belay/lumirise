import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth";

const MotionBox = motion(Box);

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { login, sendPasswordResetEmail } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, message, user } = await login(credentials);
      if (!success) throw new Error(message || "Login failed");

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", JSON.stringify(user.role));

      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (user.role === "student") navigate("/student");
      else if (user.role === "tutor") navigate("/tutor");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/");

    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!credentials.emailOrPhone || !credentials.emailOrPhone.includes("@")) {
      toast({
        title: "Email required",
        description:
          "Please enter your email to receive a password reset link.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsResetting(true);
    try {
      const { success, message } = await sendPasswordResetEmail(
        credentials.emailOrPhone
      );
      if (!success) throw new Error(message);

      toast({
        title: "Reset Link Sent",
        description: "Check your inbox for password reset instructions.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsResetting(false);
    }
  };

  const bgRight = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
  <Flex h="100vh" overflow="hidden">
    {/* LEFT PANEL */}
    <Flex
      flex="1"
      bgGradient="linear(to-r, blue.800, blue.400)"
      color="white"
      display={{ base: "none", md: "flex" }}
      align="center"
      justify="center"
      px={10}
      py={8}
      direction="column"
      textAlign="center"
    >
      <Heading size="xl" mb={4}>
        Welcome Back.
      </Heading>

      <Text fontSize="md" opacity={0.9} maxW="sm">
        Continue your journey with Lumirise and keep building your
        knowledge, skills, and impact.
      </Text>
    </Flex>

    {/* RIGHT PANEL */}
    <Flex
      flex="1"
      align="center"
      justify="center"
      bg={bgRight}
      px={6}
      py={6}
    >
      <MotionBox
        w="full"
        maxW="sm"
        bgGradient="linear(to-r, gray.100, white)"
        color="cyan.900"
        p={{ base: 5, md: 6 }}
        rounded="2xl"
        shadow="xl"
        borderWidth="1px"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <VStack spacing={4} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" fontWeight="bold">
              Sign in to your account
            </Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              Access your dashboard and continue learning.
            </Text>
          </Box>

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              {/* Email or Phone */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Email or Phone</FormLabel>
                <Input
                  name="emailOrPhone"
                  value={credentials.emailOrPhone}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      emailOrPhone: e.target.value,
                    })
                  }
                  focusBorderColor="blue.400"
                  borderRadius="lg"
                  size="md"
                />
              </FormControl>

              {/* Password */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    focusBorderColor="blue.400"
                    borderRadius="lg"
                    size="md"
                  />
                  <InputRightElement h="full">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Forgot Password */}
              <ChakraLink
                onClick={handlePasswordReset}
                fontSize="xs"
                color="blue.500"
                alignSelf="flex-end"
                _hover={{ textDecoration: "underline", color: "blue.600" }}
                cursor="pointer"
              >
                {isResetting ? "Sending reset link..." : "Forgot password?"}
              </ChakraLink>

              {/* Login Button */}
              <Button
                type="submit"
                colorScheme="blue"
                size="md"
                w="full"
                fontWeight="semibold"
                rounded="xl"
                shadow="md"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "lg",
                }}
                isLoading={isLoading}
                loadingText="Signing in..."
                spinner={<Spinner size="sm" />}
              >
                Sign In
              </Button>
            </VStack>
          </form>

          {/* Bottom Links */}
          <Text textAlign="center" fontSize="xs">
            Don't have an account?{" "}
            <Link to="/signup">
              <Text
                as="span"
                color="blue.500"
                fontWeight="medium"
                _hover={{ textDecoration: "underline" }}
              >
                Create one
              </Text>
            </Link>
          </Text>

          <Text textAlign="center" fontSize="xs">
            <Link to="/">
              <Text
                as="span"
                color="gray.500"
                _hover={{ textDecoration: "underline" }}
              >
                ← Back to Home
              </Text>
            </Link>
          </Text>
        </VStack>
      </MotionBox>
    </Flex>
  </Flex>
);

};

export default LoginPage;

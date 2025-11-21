import { 
  Input,
  Container,
  Heading,
  Box,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  HStack,
  Text,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuthStore } from "../../store/auth"; 

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
  const { login, sendPasswordResetEmail } = useAuthStore(); // 👈 ensure this exists in your auth store

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { success, message, user } = await login(credentials);

      if (!success) throw new Error(message || "Login failed");

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", JSON.stringify(user.role));
      console.log("role stored in localStorage:", user.role);
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect based on role
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

  // 👇 Password reset handler
  const handlePasswordReset = async () => {
    if (!credentials.emailOrPhone || !credentials.emailOrPhone.includes("@")) {
      toast({
        title: "Email required",
        description: "Please enter your email to receive a password reset link.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsResetting(true);
    try {
      const { success, message } = await sendPasswordResetEmail(credentials.emailOrPhone);
      if (!success) throw new Error(message || "Unable to send reset email.");

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

  return (
    <Container maxW="container.sm">
      <VStack spacing={8}>
        <Heading as="h1" size="xl" textAlign="center" mb={8}>
          Login to Your Account
        </Heading>

        <Box
          w="80%"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded="lg"
          shadow="md"
        >
          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              {/* Email or Phone */}
              <Input
                placeholder="Email or Phone"
                name="emailOrPhone"
                value={credentials.emailOrPhone}
                onChange={(e) =>
                  setCredentials({ ...credentials, emailOrPhone: e.target.value })
                }
                isRequired
              />

              {/* Password with show/hide toggle */}
              <InputGroup>
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  isRequired
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>

              {/* Forgot password link */}
              <ChakraLink
                onClick={handlePasswordReset}
                color="blue.500"
                fontSize="sm"
                alignSelf="flex-end"
                _hover={{ textDecoration: "underline", color: "blue.600" }}
                cursor="pointer"
              >
                {isResetting ? "Sending reset link..." : "Forgot password?"}
              </ChakraLink>

              {/* Buttons */}
              <HStack
                w="full"
                spacing={4}
                flexDir={{ base: "column", md: "row" }}
                mt={2}
              >
                <Button
                  colorScheme="blue"
                  w="full"
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                  spinner={<Spinner size="sm" />}
                  borderRadius="xl"
                >
                  Login
                </Button>

                <Link to="/">
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    w="full"
                    borderRadius="xl"
                  >
                    Back to Home
                  </Button>
                </Link>
              </HStack>

              {/* Signup Link */}
              <Text mt={2} fontSize="md" color="gray.400">
                Don't have an account?{" "}
                <Link to="/signup">
                  <Text
                    as="span"
                    color="blue.500"
                    fontWeight="medium"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Signup here.
                  </Text>
                </Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default LoginPage;

import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Container,
  Heading,
  Box,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  HStack,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Spinner,
  Progress,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student",
    visionStatement: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ label: "", color: "gray" });
  const [showPassword, setShowPassword] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { signup } = useAuthStore();

  const MIN_VISION = 50;
  const MAX_VISION = 200;

  // Email, Phone, Vision validation
  const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
  const isPhoneValid = formData.phone.trim().length > 0;
  const isVisionValid =
    formData.role === "student"
      ? formData.visionStatement.trim().length >= MIN_VISION &&
        formData.visionStatement.trim().length <= MAX_VISION
      : true;

  // Password Validation
  const isPasswordValid = formData.password.length >= 8;

  const checkPasswordStrength = (password) => {
    if (!password) return { label: "", color: "gray", score: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "red.400", score };
    if (score === 2 || score === 3) return { label: "Medium", color: "yellow.400", score };
    return { label: "Strong", color: "green.400", score };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSignup = async () => {
    if (!isEmailValid || !isPasswordValid || !isPhoneValid || !isVisionValid) {
      toast({
        title: "Validation Error",
        description: `Please fill all fields correctly (valid email, phone required, password ≥8 chars${
          formData.role === "student" ? `, vision ${MIN_VISION}-${MAX_VISION} chars` : ""
        }).`,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { success, message } = await signup(formData);
      if (success) {
        toast({
          title: "Account created!",
          description: message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      } else {
        throw new Error(message);
      }
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

  return (
    <Container maxW="container.sm">
      <VStack spacing={8}>
        <Heading as="h1" size="xl" textAlign="center" mt={6}>
          Create New Account
        </Heading>
        <Text fontSize="md" color="gray.500" textAlign="center" mb={4}>
          Join us and start your learning journey.
        </Text>

        <Box
          w="80%"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded="lg"
          shadow="md"
        >
          <VStack spacing={5}>
            {/* Name */}
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                borderRadius="md"
                autoComplete="name"
              />
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!isEmailValid && formData.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                borderRadius="md"
                autoComplete="email"
              />
              <FormErrorMessage>Enter a valid email address.</FormErrorMessage>
            </FormControl>

            {/* Phone */}
            <FormControl isInvalid={!isPhoneValid && formData.phone} isRequired>
              <FormLabel>Phone Number</FormLabel>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                borderRadius="md"
                autoComplete="tel"
              />
              <FormErrorMessage>Phone number is required.</FormErrorMessage>
            </FormControl>

            {/* Password with strength + toggle */}
            <FormControl isInvalid={!isPasswordValid && formData.password} isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  borderRadius="md"
                  autoComplete="new-password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>

              {formData.password && (
                <>
                  <Progress
                    value={passwordStrength.score * 25}
                    size="xs"
                    mt={2}
                    colorScheme={
                      passwordStrength.label === "Weak"
                        ? "red"
                        : passwordStrength.label === "Medium"
                        ? "yellow"
                        : "green"
                    }
                    borderRadius="md"
                  />
                  <Text mt={1} fontSize="sm" color={passwordStrength.color}>
                    Strength: {passwordStrength.label}
                  </Text>
                </>
              )}
              <FormErrorMessage>Password must be at least 8 characters.</FormErrorMessage>
            </FormControl>

            {/* Role */}
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </Select>
            </FormControl>

            {/* Vision Statement */}
            {formData.role === "student" && (
              <FormControl isInvalid={!isVisionValid && formData.visionStatement}>
                <FormLabel>Vision Statement</FormLabel>
                <Textarea
                  name="visionStatement"
                  value={formData.visionStatement}
                  onChange={handleChange}
                  placeholder={`Briefly share your vision (min ${MIN_VISION} characters)`}
                  borderRadius="md"
                  maxLength={MAX_VISION}
                />
                <Text
                  fontSize="sm"
                  color={
                    formData.visionStatement.length < MIN_VISION ||
                    formData.visionStatement.length > MAX_VISION
                      ? "red.500"
                      : "gray.500"
                  }
                  mt={1}
                  alignSelf="flex-end"
                >
                  {formData.visionStatement.length < MIN_VISION
                    ? `${MIN_VISION - formData.visionStatement.length} characters left to minimum`
                    : `${formData.visionStatement.length}/${MAX_VISION} characters`}
                </Text>
                <FormErrorMessage>
                  Vision statement must be between {MIN_VISION} and {MAX_VISION} characters.
                </FormErrorMessage>
              </FormControl>
            )}

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
                onClick={handleSignup}
                isLoading={isLoading}
                loadingText="Signing up..."
                spinner={<Spinner size="sm" />}
                borderRadius="xl"
              >
                Sign Up
              </Button>

              <Link to="/login" style={{ width: "100%" }}>
                <Button
                  variant="outline"
                  colorScheme="gray"
                  w="full"
                  borderRadius="xl"
                >
                  Login
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default SignupPage;

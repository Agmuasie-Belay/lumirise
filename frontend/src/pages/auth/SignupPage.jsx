import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
  Progress,
  useColorModeValue,
  Spinner,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";

const MotionBox = motion(Box);

const SignupPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signup } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    visionStatement: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "gray",
    score: 0,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const MIN_VISION = 50;
  const MAX_VISION = 200;

  // ================= VALIDATIONS =================

  const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
  const isPhoneValid = formData.phone.trim().length > 0;
  const isPasswordValid = formData.password.length >= 8;

  const isConfirmPasswordValid =
    formData.confirmPassword.length > 0 &&
    formData.confirmPassword === formData.password;

  const isVisionValid =
    formData.role === "student"
      ? formData.visionStatement.trim().length >= MIN_VISION &&
        formData.visionStatement.trim().length <= MAX_VISION
      : true;

  const isFormValid =
    formData.name.trim() &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isVisionValid;

  // ================= PASSWORD STRENGTH =================

  const evaluatePassword = (password) => {
    if (!password) {
      setPasswordStrength({ label: "", color: "gray", score: 0 });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = "Weak";
    let color = "red.400";

    if (score === 2 || score === 3) {
      label = "Medium";
      color = "yellow.400";
    }
    if (score === 4) {
      label = "Strong";
      color = "green.400";
    }

    setPasswordStrength({ label, color, score });
  };

  // ================= HANDLERS =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") evaluatePassword(value);
  };

  const handleSignup = async () => {
    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please ensure all fields are valid and passwords match.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const { success, message, fallbackVerificationLink } =
        await signup(formData);

      if (success) {
        toast({
          title: "Account created!",
          description: message,
          status: "success",
          duration: 4000,
          isClosable: true,
        });

        if (fallbackVerificationLink) {
          toast({
            title: "Email delivery failed",
            description: (
              <span>
                You can manually verify your account here:{" "}
                <a
                  href={fallbackVerificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#3182CE",
                    textDecoration: "underline",
                  }}
                >
                  Verify Email
                </a>
              </span>
            ),
            status: "warning",
            duration: 8000,
            isClosable: true,
          });
        }

        setTimeout(() => navigate("/login"), 500);
      } else {
        throw new Error(message);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const bgRight = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Flex h="100vh" overflow="hidden">
      {/* LEFT PANEL */}
      <Flex
        position={{ base: "relative", md: "fixed" }}
        left="0"
        top="0"
        h="100vh"
        w={{ base: "100%", md: "50%" }}
        bgGradient="linear(to-r, blue.500, cyan.400)"
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
          Learn. Grow. Rise.
        </Heading>
        <Text fontSize="md" opacity={0.9} maxW="sm">
          Lumirise empowers students and tutors to build meaningful learning
          experiences and unlock real potential.
        </Text>
      </Flex>

      {/* RIGHT PANEL */}
      <Flex
        ml={{ base: 0, md: "50%" }}
        w={{ base: "100%", md: "50%" }}
        h="100vh"
        overflowY="auto"
        bg={bgRight}
        align="flex-start"
        justify="center"
        px={6}
        py={8}
      >
        <MotionBox
          w="full"
          maxW="sm"
          bg={cardBg}
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
                Create your account
              </Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>
                Start your Lumirise journey today.
              </Text>
            </Box>

            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Full Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  focusBorderColor="blue.400"
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl
                isRequired
                isInvalid={!isEmailValid && formData.email}
              >
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  focusBorderColor="blue.400"
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl
                isRequired
                isInvalid={!isPhoneValid && formData.phone}
              >
                <FormLabel fontSize="sm">Phone Number</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  focusBorderColor="blue.400"
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Register As</FormLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  focusBorderColor="blue.400"
                  borderRadius="lg"
                >
                  <option value="student">Student</option>
                  <option value="tutor" disabled>Tutor</option>
                </Select>
              </FormControl>

              {formData.role === "student" && (
                <FormControl
                  isInvalid={!isVisionValid && formData.visionStatement}
                >
                  <FormLabel fontSize="sm">Vision Statement</FormLabel>
                  <Textarea
                    name="visionStatement"
                    value={formData.visionStatement}
                    onChange={handleChange}
                    resize="vertical"
                    minH="100px"
                    focusBorderColor="blue.400"
                    borderRadius="lg"
                  />
                  <Text
                    fontSize="xs"
                    color={!isVisionValid ? "red.500" : "gray.500"}
                    mt={1}
                  >
                    {formData.visionStatement.length < MIN_VISION
                      ? `${MIN_VISION - formData.visionStatement.length} characters left to minimum`
                      : `${formData.visionStatement.length}/${MAX_VISION} characters`}
                  </Text>
                </FormControl>
              )}

              {/* PASSWORD */}
              <FormControl
                isRequired
                isInvalid={!isPasswordValid && formData.password}
              >
                <FormLabel fontSize="sm">Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    focusBorderColor="blue.400"
                    borderRadius="lg"
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

                {formData.password && (
                  <>
                    <Progress
                      value={passwordStrength.score * 25}
                      size="xs"
                      rounded="full"
                      mt={2}
                      colorScheme={passwordStrength.color.split(".")[0]}
                    />
                    <Text fontSize="xs" mt={1}>
                      Password strength:{" "}
                      <strong>{passwordStrength.label}</strong>
                    </Text>
                  </>
                )}
              </FormControl>

              {/* CONFIRM PASSWORD */}
              <FormControl
                isRequired
                isInvalid={formData.confirmPassword && !isConfirmPasswordValid}
              >
                <FormLabel fontSize="sm">Confirm Password</FormLabel>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  focusBorderColor="blue.400"
                  borderRadius="lg"
                />
                {formData.confirmPassword && !isConfirmPasswordValid && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Passwords do not match
                  </Text>
                )}
              </FormControl>

              <Button
                colorScheme="blue"
                size="md"
                w="full"
                fontWeight="semibold"
                rounded="xl"
                shadow="md"
                _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
                onClick={handleSignup}
                isLoading={loading}
                loadingText="Signing up..."
                spinner={<Spinner size="sm" />}
                isDisabled={!isFormValid || loading}
              >
                Sign Up
              </Button>

              <Text textAlign="center" fontSize="xs">
                Already have an account?{" "}
                <Text
                  as="span"
                  color="blue.500"
                  fontWeight="medium"
                  cursor="pointer"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Text>
              </Text>
            </VStack>
          </VStack>
        </MotionBox>
      </Flex>
    </Flex>
  );
};

export default SignupPage;

// src/pages/About.jsx
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Avatar,
  Input,
  Textarea,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaLaptopCode,
  FaBriefcase,
  FaProjectDiagram,
  FaCertificate,
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const About = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Brand Colors (Blue & Gold)
  const primaryColor = "blue.600";
  const accentColor = "yellow.400";

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box bg={bg} w="full" minH="100vh" py={10}>
      {/* HERO SECTION */}
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        maxW="6xl"
        mx="auto"
        px={6}
        py={12}
      >
        <MotionVStack
          align="start"
          spacing={6}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          variants={fadeUp}
        >
          <Heading
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="extrabold"
            lineHeight="short"
            color={primaryColor}
          >
            Empower Your Career, <br />
            One Skill at a Time
          </Heading>

          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            Lumirise Career Accelerator LMS equips learners with in-demand
            skills, hands-on projects, and personalized guidance to launch and
            grow their careers.
          </Text>

          <Button
            size="lg"
            bg={accentColor}
            color="black"
            _hover={{ transform: "scale(1.05)" }}
          >
            Explore Courses
          </Button>
        </MotionVStack>

        <MotionBox
          mt={{ base: 10, md: 0 }}
          w={{ base: "full", md: "50%" }}
          h={{ base: "200px", md: "300px" }}
          bgGradient={`linear(to-tr, ${primaryColor}, ${accentColor})`}
          borderRadius="3xl"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      </Flex>

      {/* MISSION & VISION */}
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={10}
        maxW="6xl"
        mx="auto"
        mt={16}
        px={6}
      >
        {[
          {
            title: "Our Mission",
            text: "To bridge the gap between education and employability by equipping learners with the skills, confidence, and real-world experience needed to excel in the digital economy.",
          },
          {
            title: "Our Vision",
            text: "A world where every learner has access to the tools, mentorship, and opportunities required to achieve sustainable career success.",
          },
        ].map((item, i) => (
          <MotionVStack
            key={item.title}
            align="start"
            spacing={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8, delay: i * 0.2 }}
          >
            <Heading size="lg" color={primaryColor}>
              {item.title}
            </Heading>
            <Text color="gray.600">{item.text}</Text>
          </MotionVStack>
        ))}
      </SimpleGrid>

      {/* OFFERINGS */}
      <Box maxW="6xl" mx="auto" mt={20} px={6}>
        <Heading textAlign="center" mb={12} color={primaryColor}>
          What We Offer
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
          {[
            {
              icon: FaLaptopCode,
              title: "Digital Literacy & Tech Skills",
              desc: "Master web development, data analytics, and AI foundations.",
            },
            {
              icon: FaBriefcase,
              title: "Job Readiness",
              desc: "Resume building, interview prep, and career coaching.",
            },
            {
              icon: FaProjectDiagram,
              title: "Hands-On Projects",
              desc: "Portfolio-ready capstone projects for real experience.",
            },
            {
              icon: FaCertificate,
              title: "Certification",
              desc: "Earn official certificates to validate your expertise.",
            },
          ].map((feature, idx) => (
            <MotionVStack
              key={feature.title}
              bg={cardBg}
              p={6}
              borderRadius="2xl"
              boxShadow="md"
              align="start"
              spacing={4}
              _hover={{ transform: "scale(1.05)", shadow: "xl" }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <Box
                as={feature.icon}
                boxSize={10}
                color={accentColor}
              />
              <Heading size="md" color={primaryColor}>
                {feature.title}
              </Heading>
              <Text color="gray.600">{feature.desc}</Text>
            </MotionVStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* COMMUNITY */}
      <MotionVStack
        maxW="6xl"
        mx="auto"
        mt={20}
        px={6}
        textAlign="center"
        spacing={6}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <Heading color={primaryColor}>
          Join Our Growing Community
        </Heading>
        <Text color="gray.600" maxW="3xl">
          Learn alongside ambitious learners guided by mentors and industry
          professionals.
        </Text>

        <HStack spacing={10}>
          {["Amanuel", "Liya", "Bekele"].map((name) => (
            <VStack key={name}>
              <Avatar size="lg" name={name} />
              <Text fontWeight="bold" color={primaryColor}>
                {name}
              </Text>
            </VStack>
          ))}
        </HStack>
      </MotionVStack>

      {/* PREMIUM CONTACT SECTION */}
      <MotionVStack
        id="contact"
        maxW="6xl"
        mx="auto"
        mt={24}
        px={6}
        py={20}
        bgGradient={`linear(to-r, ${primaryColor}, ${accentColor})`}
        borderRadius="3xl"
        spacing={10}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <Box
          w="full"
          maxW="4xl"
          bg="whiteAlpha.200"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          p={{ base: 6, md: 10 }}
        >
          <VStack spacing={6} textAlign="center">
            <Heading color="white">
              Let’s Build Your Future Together
            </Heading>
            <Text color="whiteAlpha.900">
              Have questions? Send us a message and our team will respond
              shortly.
            </Text>
          </VStack>

          <VStack spacing={5} mt={10}>
            <Input placeholder="Your Name" bg="white" />
            <Input placeholder="Your Email" type="email" bg="white" />
            <Textarea placeholder="Your Message" rows={5} bg="white" />
            <Button
              size="lg"
              bg={accentColor}
              color="black"
              _hover={{ transform: "scale(1.05)" }}
              w="full"
            >
              Send Message
            </Button>
          </VStack>

          <HStack justify="center" spacing={6} mt={10}>
            {[FaFacebookF, FaLinkedinIn, FaTwitter].map((Icon, i) => (
              <IconButton
                key={i}
                icon={<Icon />}
                aria-label="social"
                rounded="full"
                bg="white"
                _hover={{ bg: accentColor, transform: "scale(1.1)" }}
              />
            ))}
          </HStack>
        </Box>
      </MotionVStack>
    </Box>
  );
};

export default About;
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Tag,
  TagLabel,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon, InfoIcon } from "@chakra-ui/icons";

import { useAuthStore } from "../../store/auth";

const ViewModuleDetails = ({ isOpen, onClose, module }) => {
  const { currentUser } = useAuthStore();
  const role = currentUser?.role || "visitor";

  if (!module) return null;

  // --- Counting logic ---
  const totalLessons = module.lessons?.length || 0;
  const totalMCQs = module.lessons?.reduce(
    (sum, lesson) => sum + (lesson.mcqs?.length || 0),
    0
  );
  const totalTasks = module.lessons?.reduce(
    (sum, lesson) => sum + (lesson.tasks?.length || 0),
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="2xl" p={2}>
        <ModalHeader>
          <HStack justify="space-between">
            <Text fontWeight="bold">{module.title}</Text>

            {role !== "student" && (
              <Badge
                colorScheme={
                  module.status === "Published"
                    ? "green"
                    : module.status === "Pending"
                    ? "yellow"
                    : module.status === "Rejected"
                    ? "red"
                    : "gray"
                }
                borderRadius="md"
                px={3}
                py={1}
              >
                {module.status}
              </Badge>
            )}
          </HStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack align="start" spacing={4}>
            {/* description */}
            <Box>
              <Text fontWeight="medium" mb={1}>Description</Text>
              <Text color="gray.600">{module.description}</Text>
            </Box>

            <Divider />

            {/* category, difficulty */}
            <HStack spacing={6}>
              <Box>
                <Text fontSize="sm" fontWeight="medium">Category</Text>
                <Badge colorScheme="purple">{module.category}</Badge>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium">Difficulty</Text>
                <Badge colorScheme="blue">{module.difficulty}</Badge>
              </Box>
            </HStack>

            <Divider />

            {/* tags */}
            <Box>
              <Text fontWeight="medium" mb={1}>Tags</Text>
              <HStack spacing={2} wrap="wrap">
                {module.tags?.map((tag, i) => (
                  <Tag size="md" key={i} colorScheme="teal">
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            </Box>

            <Divider />

            {/* objectives */}
            <Box w="full">
              <Text fontWeight="medium" mb={2}>Module Objectives</Text>
              <List spacing={1}>
                {module.objectives?.map((obj, index) => (
                  <ListItem key={index}>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    {obj}
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* counts */}
            <HStack spacing={8}>
              <Box>
                <Text fontWeight="medium">Lessons</Text>
                <Badge colorScheme="gray">{totalLessons}</Badge>
              </Box>
              <Box>
                <Text fontWeight="medium">MCQs</Text>
                <Badge colorScheme="gray">{totalMCQs}</Badge>
              </Box>
              <Box>
                <Text fontWeight="medium">Tasks</Text>
                <Badge colorScheme="gray">{totalTasks}</Badge>
              </Box>
            </HStack>

            <Divider />

            {/* tutor */}
            <Box>
              <Text fontWeight="medium">Tutor</Text>
              <HStack>
                <InfoIcon color="blue.400" />
                <Text>{module.tutor?.name}</Text>
              </HStack>
            </Box>

            <Divider />

            {/* pending edit/delete */}
            {module.pendingEdit?.isRequested && role !== "student" && (
              <Badge colorScheme="yellow">Edit Requested</Badge>
            )}
            {module.pendingDelete?.isRequested && role !== "student" && (
              <Badge colorScheme="red">Delete Requested</Badge>
            )}

            <Divider />

            {/* timestamps */}
            <Box>
              <Text fontSize="sm" color="gray.500">
                Created: {new Date(module.createdAt).toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Updated: {new Date(module.updatedAt).toLocaleString()}
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewModuleDetails;

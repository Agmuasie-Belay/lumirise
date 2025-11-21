import React, { useEffect } from "react";
import { useUserStore } from "../../store/user";

import {
  Box,
  Flex,
  Avatar,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";

const Students = () => {
  const {
    currentUser,
    users,
    loadingStudents: loading,
    studentsError: error,
    fetchUsers,
  } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

 

  if (loading)
    return (
      <Flex justify="center" align="center" mt={10}>
        <Spinner size="xl" />
      </Flex>
    );

  if (error)
    return (
      <Text color="red.500" fontWeight="medium">
        {error}
      </Text>
    );

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Students in Your Modules</Heading>

      {users.length === 0 ? (
        <Text>No students found in your modules.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {users.map((student) => (
            <Box
              key={student._id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              shadow="sm"
              _hover={{ shadow: "md" }}
            >
              <Flex align="center" gap={4}>
                <Avatar
                  size="lg"
                  name={student.name}
                  src={student.profilePicture || "/default-avatar.png"}
                />
                <Box>
                  <Heading size="md">{student.name}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Email: {student.email || "N/A"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Phone: {student.phone || "N/A"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Vision: {student.visionStatement?.slice(0, 50) || "N/A"}...
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default Students;

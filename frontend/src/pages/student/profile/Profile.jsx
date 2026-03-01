import {
  Box,
  Flex,
  Avatar,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Badge,
  Divider,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/user"; // Zustand store

export default function Profile() {
  const toast = useToast();
  const { currentUser, updateUser } = useUserStore();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch current user from backend if not already in store
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setUser(data.data);
      } catch (err) {
        toast({
          title: "Failed to load profile",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (!currentUser && !user) fetchProfile();
    else if (currentUser && !user) setUser(currentUser);
  }, [currentUser, user, toast]);

  if (!user) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const handleChange = (field, value) => setUser(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateUser(user._id, user);
      if (!res.success) throw new Error(res.message);

      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditMode(false);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          My Profile
        </Text>
        {!editMode ? (
          <Button colorScheme="blue" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        ) : (
          <HStack>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
              Save Changes
            </Button>
          </HStack>
        )}
      </Flex>

      <Box bg="white" p={6} rounded="xl" shadow="sm">
        <Flex gap={8} direction={{ base: "column", md: "row" }}>
          {/* LEFT SIDE - Avatar & Role */}
          <VStack align="center" spacing={4} minW="220px">
            <Avatar size="2xl" src={user.profilePicture} name={user.name} />
            {editMode && (
              <FormControl>
                <FormLabel fontSize="sm">Profile Picture URL</FormLabel>
                <Input
                  size="sm"
                  value={user.profilePicture || ""}
                  onChange={(e) => handleChange("profilePicture", e.target.value)}
                />
              </FormControl>
            )}
            <Badge colorScheme="purple" px={3} py={1} rounded="full">
              {user.role}
            </Badge>
          </VStack>

          {/* RIGHT SIDE - Editable Info */}
          <VStack align="stretch" spacing={4} flex={1}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={user.name || ""}
                isReadOnly={!editMode}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input value={user.email || ""} isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input
                value={user.phone || ""}
                isReadOnly={!editMode}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </FormControl>

            {user.role === "student" && (
              <FormControl>
                <FormLabel>Vision Statement</FormLabel>
                <Textarea
                  value={user.visionStatement || ""}
                  isReadOnly={!editMode}
                  onChange={(e) => handleChange("visionStatement", e.target.value)}
                />
              </FormControl>
            )}

           {user.role === "tutor" && ( <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea
                value={user.bio || ""}
                isReadOnly={!editMode}
                onChange={(e) => handleChange("bio", e.target.value)}
              />
            </FormControl>)}

            <Divider />

            {/* Skills */}
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Skills
              </Text>
              <Wrap>
                {(user.skills || []).map((skill, idx) => (
                  <WrapItem key={idx}>
                    <Tag colorScheme="blue">
                      <TagLabel>{skill}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* Availability */}
            {user.availability?.days?.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Availability
                </Text>
                <Text fontSize="sm">{user.availability.days.join(", ")}</Text>
                <Text fontSize="sm">
                  {user.availability.startTime} - {user.availability.endTime}
                </Text>
              </Box>
            )}

            <Divider />

            <Text fontSize="sm" color="gray.500">
              Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </Text>
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
}
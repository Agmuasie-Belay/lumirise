import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Progress,
  Tooltip,
  useToast,
  Skeleton,
  Divider,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth";
import { useEnrollmentStore } from "../../store/moduleEnrollment";
import { useModuleStore } from "../../store/module";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ViewModuleDetails from "./ViewModuleDetails";
import EditModuleModal from "./EditModuleModal";
const MotionBox = motion(Box);

const ModuleCard = ({ module, loading = false }) => {
  const handleOpenEdit = (id) => setEditingModuleId(id);
  const handleCloseEdit = () => setEditingModuleId(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const { currentUser } = useAuthStore();
  const role = currentUser?.role || "visitor";
  const {
    deleteModule,
    approveModule,
    rejectModule,
    requestApproval,
  } = useModuleStore();
  const { enrollInModule, checkEnrollment } =
    useEnrollmentStore();

  const toast = useToast();
  const navigate = useNavigate();

  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);
  const [status, setStatus] = useState(module?.status || "Draft");
  const [isViewOpen, setIsViewOpen] = useState(false);
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await checkEnrollment(module._id);
        setProgress(data.progressPercent);
        setEnrolled(data.enrolled);
      } catch (err) {
        console.error("Error loading module:", err);
      }
    };
    if (module._id) {
      loadStatus();
    }
  }, [module._id]);

  if (loading) {
    return (
      <Box borderWidth="1px" borderRadius="2xl" p={5} bg="white" shadow="md">
        <VStack align="start" spacing={3} w="full">
          <Skeleton height="20px" w="60%" />
          <Skeleton height="14px" w="90%" />
          <Skeleton height="14px" w="70%" />
          <Skeleton height="32px" w="40%" />
        </VStack>
      </Box>
    );
  }

  if (!module) return null;

  if (role === "student" && status !== "Published") return null;
  if (
    role === "tutor" &&
    module.tutor?._id !== currentUser._id &&
    status === "Draft" &&
    status === "Published"
  )
    return null;
  if (role === "admin" && status === "Draft") return null;

  const isNew =
    status === "Published" &&
    module.updatedAt &&
    Date.now() - new Date(module.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  const safeAction = async (fn, args, successMsg, errorMsg, onSuccess) => {
    try {
      setLoadingAction(true);
      const res = await fn(...args);
      if (res?.success) {
        toast({
          title: successMsg,
          description: res.message || "",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        if (onSuccess) onSuccess(res.data);
      } else {
        toast({
          title: "Error",
          description: res?.message || errorMsg,
          status: "error",
          duration: 2500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Operation failed",
        description: err.message || "Unexpected error",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = () =>
    safeAction(deleteModule, [module._id], "Module deleted", "Delete failed");

  const handleApprove = () =>
    safeAction(
      approveModule,
      [module._id],
      "Module approved",
      "Approval failed",
    );

  const handleReject = () =>
    safeAction(
      rejectModule,
      [module._id],
      "Module rejected",
      "Rejection failed",
    );

  const handleRequestApproval = async () => {
    await safeAction(
      requestApproval,
      [module._id],
      "Approval requested",
      "Request failed",
      () => setStatus("Pending"), // badge updates automatically
    );
  };

  const avgProgress =
    module.enrolledStudents?.length > 0
      ? (
          module.enrolledStudents.reduce(
            (acc, s) => acc + (s.progress || 0),
            0,
          ) / module.enrolledStudents.length
        ).toFixed(0)
      : 0;
  const requestApprovalLabel =
    status === "Published"
      ? "Approved"
      : status === "Pending"
        ? "Requested"
        : status === "Rejected"
          ? "Rejected"
          : "Request Approval";
  const requestApprovalDisabled =
    status === "Pending" || status === "Published" || status === "Rejected";

  return (
    <MotionBox
      borderWidth="1px"
      borderRadius="2xl"
      p={0}
      bg="white"
      shadow="md"
      whileHover={{ y: -4, boxShadow: "lg" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {role === "student" && (
        <Box w="full" h="32" overflow="hidden" p={0} mb={0}>
          <img
            src={module.bannerUrl || "/default-banner.jpg"} // fallback if no banner
            alt={`${module.title} Banner`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          />
        </Box>
      )}
      <Box p={4}>
        <VStack align="start" spacing={3} w="full">
          {/* Header */}
          <HStack w="full" justify="space-between" align="center">
            <HStack spacing={2}>
              <Heading size="md" noOfLines={1}>
                {module.title}
              </Heading>
              {isNew && (
                <Badge colorScheme="blue" variant="solid" borderRadius="md">
                  NEW
                </Badge>
              )}
            </HStack>
            {role !== "student" && (
              <Badge
                variant="subtle"
                colorScheme={
                  status === "Published"
                    ? "green"
                    : status === "Pending"
                      ? "yellow"
                      : status === "Draft"
                        ? "gray"
                        : "red"
                }
              >
                {status}
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {module.description || "No description available"}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Tutor: {module.tutor?.name || "Unknown"}
          </Text>
          <Divider />
          {/* STUDENT */}
          {role === "student" && (
            <>
              {loadingAction ? (
                <Skeleton height="36px" w="40%" />
              ) : enrolled ? (
                // Already enrolled
                <VStack align="start" w="full" spacing={2}>
                  <Progress
                    value={progress}
                    colorScheme={
                      progress < 50
                        ? "yellow"
                        : progress <= 75
                          ? "blue"
                          : "green"
                    }
                    w="full"
                    size="sm"
                    borderRadius="full"
                  />
                  <HStack w="full" justify="space-between">
                    <Button
                      size="sm"
                      colorScheme={progress<100?"blue":"green"}
                      onClick={async () => {
                        setLoadingAction(true);
                        try {
                          navigate(`/student/modulepage/${module._id}`);
                        } finally {
                          setLoadingAction(false);
                        }
                      }}
                    >
                      {progress <100 ? "Continue Learning":"Review"}
                    </Button>
                    {/* <Tooltip label="Mark module intro watched" fontSize="xs">
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="green"
                        onClick={() => handleRecordProgress("video", 0)}
                      >
                        + Progress
                      </Button>
                    </Tooltip> */}
                  </HStack>
                </VStack>
              ) : (
                // Not enrolled
                <HStack spacing={3}>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={async () => {
                      setLoadingAction(true);
                      try {
                        const res = await enrollInModule(module._id);
                        // Update local state
                        if (res.success) {
                          setEnrolled(true);
                          setProgress(0);
                          toast({
                            title: "Enrolled successfully",
                            status: "success",
                            duration: 2500,
                            isClosable: true,
                          });
                        } else {
                          toast({
                            title: "Already enrolled",
                            description: res.message || "",
                            status: "error",
                            duration: 2500,
                            isClosable: true,
                          });
                        }
                      } catch (err) {
                        toast({
                          title: "Enrollment failed",
                          description: err.message || "Unexpected error",
                          status: "error",
                          duration: 2500,
                          isClosable: true,
                        });
                      } finally {
                        setLoadingAction(false);
                      }
                    }}
                    isLoading={loadingAction}
                  >
                    Enroll
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => setIsViewOpen(true)}
                  >
                    View Details
                  </Button>
                </HStack>
              )}
            </>
          )}
          {/* TUTOR */}
          {role === "tutor" && (
            <>
              <HStack spacing={3}>
                {/* Request Approval Button */}
                <Button
                  size="sm"
                  colorScheme="yellow"
                  onClick={() => {
                    if (!requestApprovalDisabled) {
                      const confirmed = window.confirm(
                        "Are you sure you want to request approval for this module?",
                      );
                      if (confirmed) handleRequestApproval();
                    }
                  }}
                  isLoading={loadingAction}
                  isDisabled={requestApprovalDisabled}
                >
                  {requestApprovalLabel}
                </Button>

                <Tooltip label="Editing requires reapproval" fontSize="xs">
                  <Button
                    size="sm"
                    colorScheme="gray"
                    variant="ghost"
                    onClick={() => handleOpenEdit(module._id)}
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip label="This action is permanent" fontSize="xs">
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={handleDelete}
                    isLoading={loadingAction}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </HStack>
              {status === "Draft" && (
                <Text fontSize="xs" color="gray.500">
                  Draft – only visible to you
                </Text>
              )}
              {status === "Pending" && (
                <Text fontSize="xs" color="orange.400">
                  Awaiting admin approval
                </Text>
              )}
            </>
          )}
          {/* ADMIN */}
          {role === "admin" && (
            <>
              <Text fontSize="sm" color="gray.600">
                Students: {module.enrolledStudents?.length || 0} | Avg Progress:{" "}
                {avgProgress}%
              </Text>
              <HStack spacing={3} mt={2}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => setIsViewOpen(true)}
                >
                  View Details
                </Button>
                {status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={handleApprove}
                      isLoading={loadingAction}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={handleReject}
                      isLoading={loadingAction}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </HStack>
            </>
          )}
        </VStack>
      </Box>
      <ViewModuleDetails
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        module={module}
      />
      {editingModuleId && (
        <EditModuleModal
          isOpen={Boolean(editingModuleId)}
          onClose={handleCloseEdit}
          moduleId={editingModuleId}
        />
      )}
    </MotionBox>
  );
};

export default ModuleCard;

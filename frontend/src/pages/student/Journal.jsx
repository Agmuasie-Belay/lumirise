// src/pages/Journal.jsx
import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Textarea,
  Button,
  Text,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  IconButton,
  useToast,
  Collapse,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import { useJournalStore } from "../../store/journal.js";

export default function Journal({enrollmentId}) {
  const toast = useToast();
  //const { enrollmentId } = useParams(); // important

  const {
    fetchJournals,
    addJournal,
    updateJournal,
    deleteJournal,
    journals,
    journalLoading,
  } = useJournalStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    whatIKnow: "",
    whatIChanged: "",
    whatChallengedMe: "",
  });

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    whatIKnow: "",
    whatIChanged: "",
    whatChallengedMe: "",
  });

  // Fetch journals on mount
  useEffect(() => {
    if (enrollmentId) {
      fetchJournals(enrollmentId);
    }
  }, [enrollmentId, fetchJournals]);

  const entries = journals?.[enrollmentId] || [];
  const recentTopThree = entries.slice(0, 3);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // ADD ENTRY
  const handleAdd = async () => {
    if (!form.whatIKnow || !form.whatIChanged || !form.whatChallengedMe) {
      return toast({
        title: "Please complete all fields",
        status: "warning",
      });
    }

    const payload = {
      ...form,
      date: new Date().toISOString(),
    };

    const res = await addJournal(enrollmentId, payload);

    if (res?.success) {
      setForm({
        whatIKnow: "",
        whatIChanged: "",
        whatChallengedMe: "",
      });
      toast({ title: "Reflection saved", status: "success" });
      setShowForm(false);
    } else {
      toast({
        title: res?.message || "Failed to save",
        status: "error",
      });
    }
  };

  // OPEN EDIT
  const openEdit = (entry) => {
    setEditing(entry);
    setEditForm({
      whatIKnow: entry.whatIKnow,
      whatIChanged: entry.whatIChanged,
      whatChallengedMe: entry.whatChallengedMe,
    });
    setShowForm(true);
  };

  // SAVE EDIT
  const handleEditSave = async () => {
    if (!editing) return;

    const payload = {
      ...editForm,
      date: editing.date,
    };

    const res = await updateJournal(
      enrollmentId,
      editing._id,
      payload
    );

    if (res?.success) {
      toast({ title: "Entry updated", status: "success" });
      setEditing(null);
      setShowForm(false);
    } else {
      toast({
        title: res?.message || "Update failed",
        status: "error",
      });
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const res = await deleteJournal(enrollmentId, id);

    if (res?.success) {
      toast({ title: "Entry deleted", status: "success" });
    } else {
      toast({
        title: res?.message || "Delete failed",
        status: "error",
      });
    }
  };

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center" size="xl">
          Student Journal
        </Heading>

        <Text textAlign="center" color="gray.500">
          Track your learning reflections and growth
        </Text>

        {journalLoading && (
          <HStack justify="center">
            <Spinner />
          </HStack>
        )}

        {/* TOP 3 */}
        {recentTopThree.length > 0 && (
          <Box>
            <Heading size="md" mb={3}>
              Recent Reflections
            </Heading>

            <VStack spacing={3} align="stretch">
              {recentTopThree.map((entry) => (
                <Box
                  key={entry._id}
                  p={4}
                  bg="blue.50"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text fontWeight="bold">
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                  <Text mt={1} noOfLines={2}>
                    {entry.whatIKnow}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* TOGGLE FORM */}
        <Button
          colorScheme="blue"
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
          }}
        >
          {showForm
            ? "Hide Reflection Form"
            : "Enter Today's Reflection"}
        </Button>

        <Collapse in={showForm}>
          <Box p={6} bg="white" rounded="xl" shadow="md">
            <FormControl mb={4}>
              <FormLabel>What I studied</FormLabel>
              <Textarea
                name="whatIKnow"
                value={
                  editing
                    ? editForm.whatIKnow
                    : form.whatIKnow
                }
                onChange={(e) =>
                  editing
                    ? setEditForm((s) => ({
                        ...s,
                        whatIKnow: e.target.value,
                      }))
                    : handleChange(e)
                }
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>What I improved</FormLabel>
              <Textarea
                name="whatIChanged"
                value={
                  editing
                    ? editForm.whatIChanged
                    : form.whatIChanged
                }
                onChange={(e) =>
                  editing
                    ? setEditForm((s) => ({
                        ...s,
                        whatIChanged: e.target.value,
                      }))
                    : handleChange(e)
                }
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>What challenged me</FormLabel>
              <Textarea
                name="whatChallengedMe"
                value={
                  editing
                    ? editForm.whatChallengedMe
                    : form.whatChallengedMe
                }
                onChange={(e) =>
                  editing
                    ? setEditForm((s) => ({
                        ...s,
                        whatChallengedMe: e.target.value,
                      }))
                    : handleChange(e)
                }
              />
            </FormControl>

            <HStack>
              <Button
                colorScheme="blue"
                onClick={
                  editing ? handleEditSave : handleAdd
                }
                isLoading={journalLoading}
              >
                {editing ? "Save Changes" : "Save Reflection"}
              </Button>

              {editing && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </HStack>
          </Box>
        </Collapse>

        {/* ALL ENTRIES */}
        <Heading size="md">All Reflections</Heading>

        {entries.length === 0 ? (
          <Text color="gray.500">
            No reflections yet — start today!
          </Text>
        ) : (
          <Accordion allowMultiple>
            {entries.map((entry) => (
              <AccordionItem
                key={entry._id}
                border="1px solid"
                borderColor="gray.100"
                rounded="lg"
                mb={3}
                bg="white"
                p={3}
              >
                <HStack>
                  <AccordionButton as={Box} flex="1" px={0}>
                    <Box textAlign="left" flex="1">
                      <Text fontWeight="bold">
                        {new Date(
                          entry.date
                        ).toLocaleDateString()}
                      </Text>
                      <Text
                        color="gray.600"
                        fontSize="sm"
                        noOfLines={1}
                      >
                        {entry.whatIKnow}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>

                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => openEdit(entry)}
                  />
                  <IconButton
                    aria-label="Delete"
                    icon={<DeleteIcon />}
                    size="sm"
                    onClick={() =>
                      handleDelete(entry._id)
                    }
                  />
                </HStack>

                <AccordionPanel mt={2}>
                  <Text>
                    <b>What I studied:</b>{" "}
                    {entry.whatIKnow}
                  </Text>
                  <Text mt={2}>
                    <b>What I improved:</b>{" "}
                    {entry.whatIChanged}
                  </Text>
                  <Text mt={2}>
                    <b>What challenged me:</b>{" "}
                    {entry.whatChallengedMe}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </VStack>
    </Container>
  );
}
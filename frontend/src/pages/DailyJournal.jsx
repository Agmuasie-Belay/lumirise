// src/pages/DailyJournal.jsx
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
  Spacer,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useAuthStore } from "../store/auth";
import { apiFetch } from "../store/api";

const DailyJournal = () => {
  const { currentUser } = useAuthStore && useAuthStore();
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    whatIKnow: "",
    whatIChanged: "",
    whatChallengedMe: "",
  });

  // Fetch all journal entries
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("http://localhost:5000/api/journal");
      setEntries(data.data || []);
    } catch (err) {
      console.error("Fetch journal error:", err.message);
      toast({ title: "Could not load journal", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Add new journal entry
  const handleAdd = async () => {
    if (!form.whatIKnow || !form.whatIChanged || !form.whatChallengedMe) {
      toast({ title: "Please complete all fields", status: "warning", duration: 2000 });
      return;
    }

    if (form.whatIKnow.length < 5 || form.whatIChanged.length < 5 || form.whatChallengedMe.length < 5) {
      toast({ title: "Each field must be at least 5 characters", status: "warning", duration: 2000 });
      return;
    }

    try {
      const payload = {
        ...form,
        date: new Date().toISOString(),
      };

      const data = await apiFetch("http://localhost:5000/api/journal", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      setEntries((prev) => [data.entry, ...prev]);
      setForm({ whatIKnow: "", whatIChanged: "", whatChallengedMe: "" });
      toast({ title: "Reflection saved", status: "success" });
    } catch (err) {
      toast({ title: err.message || "Failed to save", status: "error" });
    }
  };

  // Edit modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ whatIKnow: "", whatIChanged: "", whatChallengedMe: "" });

  const openEdit = (entry) => {
    setEditing(entry);
    setEditForm({
      whatIKnow: entry.whatIKnow,
      whatIChanged: entry.whatIChanged,
      whatChallengedMe: entry.whatChallengedMe,
    });
    onOpen();
  };

  // Save edited journal
  const handleEditSave = async () => {
    if (!editForm.whatIKnow || !editForm.whatIChanged || !editForm.whatChallengedMe) {
      toast({ title: "Please complete all fields", status: "warning", duration: 2000 });
      return;
    }

    if (editForm.whatIKnow.length < 5 || editForm.whatIChanged.length < 5 || editForm.whatChallengedMe.length < 5) {
      toast({ title: "Each field must be at least 5 characters", status: "warning", duration: 2000 });
      return;
    }

    try {
      const payload = {
        ...editForm,
        date: editing.date || new Date().toISOString(),
      };

      const data = await apiFetch(`http://localhost:5000/api/journal/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      setEntries((prev) => prev.map((e) => (e._id === editing._id ? data.entry : e)));
      toast({ title: "Entry updated", status: "success" });
      onClose();
    } catch (err) {
      toast({ title: err.message || "Update failed", status: "error" });
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await apiFetch(`http://localhost:5000/api/journal/${entryId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e._id !== entryId));
      toast({ title: "Entry deleted", status: "success" });
    } catch (err) {
      toast({ title: err.message || "Delete failed", status: "error" });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">My Reflection Journal</Heading>

        <Box p={4} bg="white" rounded="lg" shadow="sm">
          <Text mb={2} fontWeight="semibold">Reflect for today</Text>
          <FormControl mb={2}>
            <FormLabel>What I know / studied</FormLabel>
            <Textarea name="whatIKnow" value={form.whatIKnow} onChange={handleChange} placeholder="What did you study or understand?" />
          </FormControl>
          <FormControl mb={2}>
            <FormLabel>What I changed / improved</FormLabel>
            <Textarea name="whatIChanged" value={form.whatIChanged} onChange={handleChange} placeholder="Any changes or improvements?" />
          </FormControl>
          <FormControl>
            <FormLabel>What challenged me</FormLabel>
            <Textarea name="whatChallengedMe" value={form.whatChallengedMe} onChange={handleChange} placeholder="What obstacle did you face?" />
          </FormControl>
          <HStack mt={3}>
            <Button colorScheme="blue" onClick={handleAdd}>Save Reflection</Button>
            <Text color="gray.500" fontSize="sm">You can submit one reflection per day.</Text>
            <Spacer />
          </HStack>
        </Box>

        <Heading size="md">Previous Reflections</Heading>

        {entries.length === 0 ? (
          <Text color="gray.500">No reflections yet — start reflecting today!</Text>
        ) : (
          <Accordion allowMultiple>
            {entries.map((entry) => (
              <AccordionItem key={entry._id} border="1px solid" borderColor="gray.100" rounded="md" mb={3} bg="white" p={3}>
                <HStack>
                  <AccordionButton as={Box} flex="1" px={0}>
                    <Box textAlign="left" flex="1">
                      <Text fontWeight="bold">{new Date(entry.date).toLocaleDateString()}</Text>
                      <Text color="gray.600" fontSize="sm" noOfLines={1}>{entry.whatIKnow}</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>

                  <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" onClick={() => openEdit(entry)} />
                  <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" onClick={() => handleDelete(entry._id)} />
                </HStack>

                <AccordionPanel pb={4} mt={2}>
                  <Text><b>What I know:</b> {entry.whatIKnow}</Text>
                  <Text mt={2}><b>What I changed:</b> {entry.whatIChanged}</Text>
                  <Text mt={2}><b>What challenged me:</b> {entry.whatChallengedMe}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </VStack>

      {/* Edit modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Reflection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>What I know</FormLabel>
              <Textarea value={editForm.whatIKnow} onChange={(e) => setEditForm(s => ({ ...s, whatIKnow: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>What I changed</FormLabel>
              <Textarea value={editForm.whatIChanged} onChange={(e) => setEditForm(s => ({ ...s, whatIChanged: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>What challenged me</FormLabel>
              <Textarea value={editForm.whatChallengedMe} onChange={(e) => setEditForm(s => ({ ...s, whatChallengedMe: e.target.value }))} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSave}>Save</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DailyJournal;

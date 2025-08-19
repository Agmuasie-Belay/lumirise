import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Text,
  Image,
  useColorModeValue,
  useToast,
  useDisclosure,
  ModalOverlay,
  ModalHeader,
  Modal,
  ModalCloseButton,
  ModalBody,
  ModalContent, 
  VStack,
  Input, Button,ModalFooter
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { useState } from "react";
const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct]=useState(product);
  const textColor = useColorModeValue("gray.600", "gray.200");
  const bgColor = useColorModeValue("white", "gray.800");

  const { deleteProduct, updateProduct } = useProductStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeleteProduct = async (product_id) => {
    const { success, message } = await deleteProduct(product_id);
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProduct=async(product_id, updatedProduct)=>{
    const {success, message} = await updateProduct(product_id, updatedProduct)
    onClose();

    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    }
    
  

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      boxShadow="md"
      transition="all .3s"
      _hover={{ shadow: "lg" }}
    >
      <Image
        src={product.image}
        alt={product.name}
        h={36}
        w="full"
        objectFit="cover"
        _hover={{ transform: "scale(1.02)" }}
      />
      <Box p={4}>
        <Heading as="h3" size="md" mb={2} />
        <Text
          mt={2}
          fontWeight="bold"
          fontSize="xl"
          noOfLines={1}
          isTruncated
          color={"gray.400"}
        >
          {product.name}
        </Text>
        <Text color={textColor}>${product.price}</Text>
        <HStack spacing={2} mt={2}>
          <IconButton
            icon={<EditIcon />}
            aria-label="Edit Product"
            colorScheme="blue"
            onClick={onOpen}
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label="Edit Product"
            colorScheme="red"
            onClick={() => handleDeleteProduct(product._id)}
          />
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Product Name"
                name="name"
                value={updatedProduct.name}
                onChange = {(e)=>setUpdatedProduct({...updatedProduct, name:e.target.value})}
              />
              <Input
                placeholder="Price"
                name="price"
                value={updatedProduct.price}
                onChange = {(e)=>setUpdatedProduct({...updatedProduct, price:e.target.value})}
              />
              <Input
                placeholder="Image URL"
                name="image"
                value={updatedProduct.image}
                onChange = {(e)=>setUpdatedProduct({...updatedProduct, image:e.target.value})}
              />
              <ModalFooter>
                <Button colorScheme='blue'
                onClick={()=>handleUpdateProduct(product._id, updatedProduct)}
                mr={3}>
                  Update
                </Button>
                <Button variant='ghost' onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductCard;

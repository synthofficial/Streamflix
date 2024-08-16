import {
    Button,
    Text,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Avatar,
    useToast,
    Input,
    Tooltip,
  } from "@chakra-ui/react";
  import { useState } from "react";
  
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
  }
  
  const ProfileModal: React.FC<Props> = ({ isOpen, onClose, onOpen }) => {
    const [avatarUrl, setAvatarUrl] = useState<string>(
      localStorage.getItem("avatarUrl") || "user-avatar-url"
    );
    const [name, setName] = useState<string>(
      localStorage.getItem("username") || "User"
    )
    const toast = useToast();

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
      console.log(event.target.value);
      localStorage.setItem("username", event.target.value);
    };
  
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAvatarUrl(base64String);
          localStorage.setItem("avatarUrl", base64String);
          toast({
            title: "Avatar updated",
            description: "Your avatar has been updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        };
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <>
        <Modal motionPreset="scale" isOpen={isOpen} onClose={onClose}>
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent bg={"#18181b"} color={"white"} width={"900px"}>
            <ModalHeader>Profile Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <div className="flex flex-col gap-2 p-2 w-full">
              <div className="flex justify-center rounded-lg w-full">
                {/* Clickable Avatar */}
                <label htmlFor="upload-avatar" style={{ cursor: 'pointer' }}>
                  <Tooltip hasArrow label="Click to change." bg={"#27272a"}>
                    <Avatar
                        size="xl"
                        name="User Name"
                        src={avatarUrl}
                        className="mb-2"
                    />
                  </Tooltip>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <Text className="text-white">Username</Text>
                <Input placeholder={name} onChange={handleNameChange} bg={"#27272a"} colorScheme="brand" borderColor={"#3f3f46"} _hover={{ borderColor: "brand.500" }} _focus={{ borderColor: "brand.500" }} />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="upload-avatar"
              />
            </div>
          </ModalBody>
  
            <ModalFooter>
              <Button colorScheme="brand" mr={3} onClick={onClose}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default ProfileModal;
  
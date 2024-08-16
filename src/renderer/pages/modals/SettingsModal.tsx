import { Button, Text, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Switch, extendTheme, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import ColorPicker from "../../../components/ColorPicker";
import { IoIosArrowDown } from "react-icons/io";
import { generatePalette } from "../../../modules/ThemeUtils";

interface Props{
    isOpen : boolean;
    onClose : () => void;
    onOpen : () => void;
}

const SettingsModal : React.FC<Props> = ({ isOpen, onClose, onOpen }) => {
    const handleColorChange = (color: string) => {
        localStorage.setItem('keyColor', color);
        console.log(color);
      };

    return (
      <>  
        <Modal motionPreset="scale" isOpen={isOpen} onClose={onClose}>
          <ModalOverlay bg="blackAlpha.600" />
          <ModalContent bg={'#18181b'} color={'white'} width={"900px"}>
            <ModalHeader>Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="flex flex-col gap-2">
                { /* Settings content */ }
                <div className="flex flex-row gap-2 bg-zinc-800 p-2 rounded-lg items-center transition-all duration-300 hover:bg-zinc-700">
                    <div className="flex flex-col gap-auto">
                        <Text className="text-white">Theme</Text>
                        <Text className="text-gray-400 text-xs">Change the appearance of the app.</Text>
                    </div>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<IoIosArrowDown />} variant={"solid"} _active={{ bg: "#18181b" }} _hover={{ bg: "#18181b" }} bg="#18181b" className="ml-auto">
                            <div className="flex flex-row gap-2 items-center">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: localStorage.getItem("keyColor") || "#000" }}></span>                                <Text className="text-white">{localStorage.getItem("keyColor")}</Text>
                            </div>
                        </MenuButton>
                        <MenuList padding={0} bg={"transparent"} border={0}>
                            <ColorPicker onChange={handleColorChange} />
                        </MenuList>
                    </Menu>
                    { /* <ColorPicker onChange={handleColorChange} /> */ }
                </div>
              </div>
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='brand' mr={3} onClick={onClose}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )

}

export default SettingsModal;
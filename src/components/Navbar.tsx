import { Avatar, Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { IoHomeOutline, IoHomeSharp } from "react-icons/io5";
import { FaCog, FaListAlt } from "react-icons/fa";
import { useState } from "react";
import ProfileModal from "../renderer/pages/modals/ProfileModal";
import SettingsModal from "../renderer/pages/modals/SettingsModal";

interface Props {
    selectedTab : string;
    onTabChange : (tab: string) => void;
}

const Navbar : React.FC<Props> = ({ selectedTab, onTabChange }) => {

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);


    return(
        <>
        <Flex
            as="header"
            position="absolute"
            bottom={10}
            left={"48%"}
            mb={4}
            height="50px"
            zIndex={10}
            w={"200px"}
            bg="dark.200"
            borderRadius={"20px"}
            className="items-center"
            flexDirection="row"
            p={2}
        >
            <Tooltip hasArrow label="Home">
                <IconButton
                    aria-label="Home"
                    icon={<IoHomeSharp />}
                    size="md"
                    variant="ghost"
                    color="white"
                    cursor="pointer"
                    _hover={{ bg: 'dark.300' }}
                    onClick={() => onTabChange('home')}
                />
            </Tooltip>

            <Tooltip hasArrow label="Watchlist">
                <IconButton
                    aria-label="List"
                    icon={<FaListAlt />}
                    size="md"
                    variant="ghost"
                    color="white"
                    cursor="pointer"
                    _hover={{ bg: 'dark.300' }}
                    onClick={() => onTabChange('watchlist')}
                />
            </Tooltip>
            <Tooltip hasArrow label="Settings">
                <IconButton
                    aria-label="Settings"
                    icon={<FaCog className="text-white" />}
                    _hover={{ bg: 'dark.200'}}
                    onClick={() => setIsSettingsOpen(true)}
                    variant="ghost"
                    mr={2}
                />
            </Tooltip>
            <Avatar
                size="sm"
                src={localStorage.getItem('avatarUrl') || undefined}
                cursor="pointer"
                onClick={() => setIsProfileOpen(true)}
            />
        </Flex>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onOpen={() => setIsSettingsOpen(true)} />
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onOpen={() => setIsProfileOpen(true)} />
        </>
    );
}

export default Navbar
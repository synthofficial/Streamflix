import React from 'react';
import { Box, VStack, Text, Icon, Flex } from '@chakra-ui/react';
import { FaHome, FaHeart, FaFilm, FaTv } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { icon: FaHome, label: 'Home' },
    { icon: FaHeart, label: 'Favorites' },
    { icon: FaFilm, label: 'Movies' },
    { icon: FaTv, label: 'TV Shows' },
  ];

  return (
    <Box
      width={isOpen ? '200px' : '60px'}
      bg="gray.800"
      height="100%"
      transition="width 0.3s"
      overflow="hidden"
      boxShadow="2xl"
    >
        <Box h="1px" bg="gray.700" />
      <VStack spacing={2} align="stretch" pt={4}>
        {menuItems.map((item, index) => (
          <Flex
            key={index}
            p={3}
            cursor="pointer"
            alignItems="center"
            _hover={{ bg: 'brand.500', color: 'white' }}
            transition="all 0.3s"
            borderRadius={isOpen ? 'md' : 'full'}
            mx={2}
          >
            <Icon as={item.icon} boxSize={6} mr={isOpen ? 3 : 0} />
            {isOpen && <Text fontSize="md">{item.label}</Text>}
          </Flex>
        ))}
        <Box h="1px" bg="gray.700" />
      </VStack>
    </Box>
  );
};

export default Sidebar;
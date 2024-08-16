import React from 'react';
import { Flex, Box, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FaMinus, FaRegSquare, FaTimes } from 'react-icons/fa';
import { ipcRenderer } from 'electron';

const TitleBar: React.FC = () => {
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const iconColor = useColorModeValue('white', 'gray.200');

  const handleMinimize = () => {
    ipcRenderer.send('minimize');
  };

  const handleMaximize = () => {
    ipcRenderer.send('maximize');
  };

  const handleClose = () => {
    ipcRenderer.send('close');
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px={2}
      bg={"gray.900"}
      className="draggable overflow-hidden"
    >
      <Flex marginLeft={'auto'} gap={4}>
        <IconButton
          aria-label="Minimize"
          icon={<FaMinus />}
          size="sm"
          variant="ghost"
          color={iconColor}
          cursor={'pointer'}
          _hover={{ bg: 'gray.700' }}
          onClick={handleMinimize}
        />
        <IconButton
          aria-label="Maximize"
          icon={<FaRegSquare />}
          size="sm"
          variant="ghost"
          color={iconColor}
          cursor={'pointer'}
          _hover={{ bg: 'gray.700' }}
          onClick={handleMaximize}
        />
        <IconButton
          aria-label="Close"
          icon={<FaTimes />}
          size="sm"
          variant="ghost"
          color={iconColor}
          cursor={'pointer'}
          _hover={{ bg: 'red.700' }}
          onClick={handleClose}
        />
      </Flex>
    </Flex>
  );
};

export default TitleBar;
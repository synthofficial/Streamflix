import React from 'react';
import { Flex, Box, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FaMinus, FaRegSquare, FaTimes } from 'react-icons/fa';
import { ipcRenderer } from 'electron';

const TitleBar: React.FC = () => {
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
      bg={"dark.200"}
      className="draggable overflow-hidden"
    >
      <Flex marginLeft={'auto'} gap={1}>
        <IconButton
          aria-label="Minimize"
          borderRadius={0}
          icon={<FaMinus />}
          size="sm"
          variant="ghost"
          color={iconColor}
          cursor={'pointer'}
          _hover={{ bg: 'dark.300' }}
          onClick={handleMinimize}
        />
        <IconButton
          aria-label="Maximize"
          borderRadius={0}
          icon={<FaRegSquare />}
          size="sm"
          variant="ghost"
          color={iconColor}
          cursor={'pointer'}
          _hover={{ bg: 'dark.300' }}
          onClick={handleMaximize}
        />
        <IconButton
          aria-label="Close"
          borderRadius={0}
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
import React, { useState, useEffect } from 'react';
import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Progress, Text, useColorModeValue } from "@chakra-ui/react";
import { ipcRenderer } from "electron";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    updateDetails: any;
}

const UpdateModal: React.FC<Props> = ({ isOpen, onClose, updateDetails }) => {
    const bgColor = useColorModeValue('gray.800', 'gray.900');
    const inputBgColor = useColorModeValue('gray.700', 'gray.800');
    const [downloadProgress, setDownloadProgress] = useState({
        percent: 0,
        mbDownloaded: "0",
        mbTotal: "0"
    });
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    useEffect(() => {
        const downloadListener = (event: any, info: any) => {
            console.log("Downloading progress:", info);
            setDownloadProgress({
                percent: info.percent,
                mbDownloaded: ((info.percent * info.total) / 100 / 1024 / 1024).toFixed(2),
                mbTotal: (info.total / 1024 / 1024).toFixed(2)
            });
        };

        ipcRenderer.on("downloading", downloadListener);

        return () => {
            ipcRenderer.removeListener("downloading", downloadListener);
        };
    }, []);

    const handleDownload = () => {
        setIsDownloading(true);
        ipcRenderer.send("download-update");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader>
                    <Text className="text-white">Update Available</Text>
                    <Text className="text-gray-500 text-sm">New Version: {updateDetails?.version}</Text>
                </ModalHeader>
                <ModalBody>
                    {isDownloading ? (
                        <Flex direction="column">
                            <Flex justifyContent="flex-end" textColor="gray.400" mb={2}>
                                <Text>{downloadProgress.mbDownloaded} / {downloadProgress.mbTotal} MB</Text>
                            </Flex>
                            <Progress 
                                value={downloadProgress.percent} 
                                size="xs"
                                rounded={"2px"}
                                colorScheme="brand" 
                                width="100%"
                            />
                        </Flex>
                    ) : (
                        <Flex
                            bg={inputBgColor}
                            p={2}
                            borderRadius="md"
                            boxShadow="lg"
                            maxH="200px"
                            overflow="auto"
                        >
                            <Text className="text-gray-400">{updateDetails?.releaseNotes?.replaceAll("<p>", "").replaceAll("</p>", "")}</Text>
                        </Flex>
                    )}
                    <Flex mt={2} justifyContent="flex-end">
                        {!isDownloading && (
                            <Button colorScheme="brand" onClick={handleDownload}>
                                Download
                            </Button>
                        )}
                    </Flex>
                </ModalBody>
                <ModalCloseButton />
            </ModalContent>
        </Modal>
    );
};

export default UpdateModal;
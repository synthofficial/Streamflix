import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box, Flex, VStack, IconButton, Input, useColorModeValue, Avatar, Text, Image } from '@chakra-ui/react';
import { FaBars, FaCog, FaUser } from 'react-icons/fa';
import Homepage from './pages/Homepage';
import { generatePalette } from '../modules/ThemeUtils';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import ProfileModal from './pages/modals/ProfileModal';
import SettingsModal from './pages/modals/SettingsModal';
import MediaModal from './pages/modals/MediaModal';
import { MediaProvider } from './contexts/MediaContext';
import { useVideoPlayer, VideoPlayerProvider } from './contexts/VideoPlayerContext';
import { searchMedia } from '../modules/api/Movies';
import TitleBar from '../components/TitleBar';

interface SearchResult {
  id: string;
  title: string;
  type: 'Movie' | 'Show' | 'Anime';
  thumbnail: string;
  releaseDate: string;
}

const AppContent = () => {
  const [keyColor, setKeyColor] = useState<string>('#6B46C1');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const { showPlayer, currentMedia, currentEpisode, currentUrl, setShowPlayer, setCurrentMedia, setCurrentEpisode, setCurrentUrl } = useVideoPlayer();

  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const inputBgColor = useColorModeValue('gray.700', 'gray.800');

  const debouncedSearch = useCallback((term: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (term.length > 2) {
      setIsSearching(true);
      const newTimeout = setTimeout(async () => {
        try {
          const results = await searchMedia(term);
          console.log(results[0])
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching media:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 1000);  // 1 second delay

      setSearchTimeout(newTimeout);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchTimeout]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleResultClick = (result: SearchResult) => {
    setSelectedMedia(result);
    setIsMediaModalOpen(true);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handlePlayClick = (media: any, episodeData?: any, episodeUrl?: string) => {
    setCurrentMedia(media);
    setCurrentEpisode(episodeData);
    setCurrentUrl(episodeUrl!);
    setShowPlayer(true);
    setIsMediaModalOpen(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Router>
      <Flex direction="column" height="100vh" position="relative">
        {!showPlayer && (
          <Flex
            as="header"
            align="center"
            justify="space-between"
            wrap="wrap"
            padding="1.5rem"
            bg={bgColor}
            color="white"
          >
              <Flex align="center" mr={5}>
                <IconButton
                  aria-label="Open sidebar"
                  icon={<FaBars className="text-white" />}
                  _hover={{ bg: 'gray.700'}}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  variant="ghost"
                  mr={3}
                />
                <Box fontWeight="bold" fontSize="xl" color="brand.500">
                  Streamflix
                </Box>
              </Flex>

              <Flex align="center" flexGrow={1} justifyContent="center" position="relative">
                <Input
                  placeholder="Search movies, shows, anime..."
                  bg={inputBgColor}
                  border={0}
                  _placeholder={{ color: 'gray.400' }}
                  maxWidth="400px"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm.length > 2 && (searchResults.length > 0 || isSearching) && (
                  <Box
                    position="absolute"
                    top="100%"
                    left="50%"
                    transform="translateX(-50%)"
                    width="400px"
                    bg={inputBgColor}
                    mt={2}
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={10}
                    maxHeight="400px"
                    overflowY="auto"
                  >
                    {isSearching ? (
                      <Text p={2} color="gray.400">Searching...</Text>
                    ) : (
                      searchResults.map((result) => (
                        <Flex
                          key={result.id}
                          p={2}
                          _hover={{ bg: 'gray.600' }}
                          cursor="pointer"
                          onClick={() => handleResultClick(result)}
                          alignItems="center"
                        >
                          <Image src={result.thumbnail} alt={result.title} boxSize="40px" objectFit="cover" mr={3} />
                          <Box>
                            <Text fontWeight="bold">{result.title}</Text>
                            <Text fontSize="sm" color="gray.300">{result.type} • {result.releaseDate}</Text>
                          </Box>
                        </Flex>
                      ))
                    )}
                  </Box>
                )}
              </Flex>

              <Flex align="center">
                <IconButton
                  aria-label="Settings"
                  icon={<FaCog className="text-white" />}
                  _hover={{ bg: 'gray.700'}}
                  onClick={() => setIsSettingsOpen(true)}
                  variant="ghost"
                  mr={2}
                />
                <Avatar
                  size="sm"
                  src={localStorage.getItem('avatarUrl') || undefined}
                  cursor="pointer"
                  onClick={() => setIsProfileOpen(true)}
                />
              </Flex>
          </Flex>
        )}
        <Flex flex={1} overflow="hidden">
          {!showPlayer && <Sidebar isOpen={sidebarOpen} />}
          <Box flex={1} overflowY="hidden" bg="gray.900">
            <Routes>
              <Route path="/" element={<Homepage />} />
            </Routes>
          </Box>
        </Flex>
        {showPlayer && currentMedia && (
          <VideoPlayer
            // @ts-ignore
            movieData={currentMedia}
            episodeData={currentEpisode}
            episodeUrl={currentUrl!}
            onClose={() => {
              setShowPlayer(false);
              setCurrentMedia(null);
              setCurrentEpisode(null);
              setCurrentUrl(null);
            }}
          />
        )}
      </Flex>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onOpen={() => setIsProfileOpen(true)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onOpen={() => setIsSettingsOpen(true)} />
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        media={selectedMedia!}
        onPlayClick={handlePlayClick}
      />
    </Router>
  );
};

export default function App(){
  const [keyColor, setKeyColor] = useState<string>(localStorage.getItem('keyColor') || '#6B46C1'); // Updated to a purple shade

  const theme = useMemo(() => {
    const palette = generatePalette(keyColor);
    return extendTheme({
      colors: {
        brand: palette,
      },
      styles: {
        global: {
          body: {
            bg: '#1A202C', // Dark background
            color: 'white'
          }
        }
      },
      components: {
        Button: {
          baseStyle: {
            fontWeight: 'bold',
            borderRadius: 'full',
          },
          variants: {
            solid: {
              bg: 'brand.500',
              color: 'white',
              _hover: {
                bg: 'brand.600',
              },
            },
          },
        },
      },
    });
  }, [keyColor]);

  useEffect(() => {
    const checkForUpdates = () => {
      const savedColor = localStorage.getItem('keyColor');
      if (savedColor && savedColor !== keyColor) {
        setKeyColor(savedColor);
      }
    };

    const intervalId = setInterval(checkForUpdates, 500);

    return () => clearInterval(intervalId);
  }, [keyColor]);

  return(
    <ChakraProvider theme={theme}>
      <VideoPlayerProvider>
        <MediaProvider>
          <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
            <TitleBar />
            <Box flex={1} className="overflow-hidden">
              <AppContent />
            </Box>
          </Box>
        </MediaProvider>
      </VideoPlayerProvider>
    </ChakraProvider>
  )
}
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box, Flex, IconButton, Input, useColorModeValue, Avatar, Text, Image, Tooltip } from '@chakra-ui/react';
import { FaCog, FaDiscord } from 'react-icons/fa';
import Homepage from './pages/Homepage';
import { generatePalette } from '../modules/ThemeUtils';
import VideoPlayer from '../components/VideoPlayer';
import ProfileModal from './pages/modals/ProfileModal';
import SettingsModal from './pages/modals/SettingsModal';
import MediaModal from './pages/modals/MediaModal';
import { MediaProvider } from './contexts/MediaContext';
import { useVideoPlayer, VideoPlayerProvider } from './contexts/VideoPlayerContext';
import { searchMedia } from '../modules/api/Movies';
import TitleBar from '../components/TitleBar';
import { ipcRenderer } from 'electron';
import UpdateModal from './pages/modals/UpdateModal';

interface SearchResult {
  id: string;
  title: string;
  type: 'Movie' | 'Show' | 'Anime';
  thumbnail: string;
  releaseDate: string;
}

const AppContent = () => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { showPlayer, currentMedia, currentEpisode, currentUrl, setShowPlayer, setCurrentMedia, setCurrentEpisode, setCurrentUrl } = useVideoPlayer();

  const bgColor = useColorModeValue('dark.100', 'gray.900');
  const inputBgColor = useColorModeValue('dark.200', 'gray.800');

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

  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  ipcRenderer.on('update-available', () => {
    console.warn("update found!")
    setShowUpdateModal(true)
  })

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
            padding="1.5rem"
            height={20}
            bg={bgColor}
            color="white"
          >
              <Flex align="center" mr={5}>
                <Box fontWeight="bold" fontSize="xl" color="brand.500">
                  Streamflix
                </Box>
              </Flex>

              <Flex align="center" flexGrow={1} justifyContent="center" position="relative">
                <Input
                  placeholder="Search movies, shows, anime..."
                  className={`${isSearchFocused ? "scale-105" : "scale-100"} transition-all duration-300`}
                  bg={inputBgColor}
                  border={0}
                  _placeholder={{ color: 'gray.400' }}
                  maxWidth="400px"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}

                />
                {searchTerm.length > 2 && (searchResults.length > 0 || isSearching) && isSearchFocused && (
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
                <Tooltip hasArrow label="Support Server">
                  <IconButton
                    aria-label="Support Server"
                    icon={<FaDiscord className="text-white" />}
                    _hover={{ bg: 'dark.200'}}
                    variant="ghost"
                    mr={2}
                    onClick={() => window.open('https://discord.gg/dpsjsrDjnV')}
                  />
                </Tooltip>

              </Flex>
          </Flex>
        )}
        <Flex flex={1} overflow="hidden">
          <Box flex={1} overflowY="hidden" bg="dark.100" className={`${isSearchFocused ? "blur-sm transition-all duration-300" : ""}`}>
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

  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateDetails, setUpdateDetails] = useState<any>(null);



  useEffect(() => {
    const updateListener = (event: Electron.IpcRendererEvent, info: any) => {
      console.log('Update available:', info);
      setUpdateDetails(info);
      setShowUpdateModal(true);
    };
  
    ipcRenderer.on('update-available', updateListener);
  
    // Trigger a check for updates
    ipcRenderer.send('check-for-updates');
  
    return () => {
      ipcRenderer.removeListener('update-available', updateListener);
    };
  }, []);
  

  const theme = useMemo(() => {
    const palette = generatePalette(keyColor);
    return extendTheme({
      colors: {
        brand: palette,
        dark: {
          100: '#121212',
          200: '#282828',
          300: '#3f3f3f'
        }
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
          <UpdateModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} updateDetails={updateDetails} />
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
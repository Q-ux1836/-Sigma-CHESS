
import React, { useState } from 'react';
import WebChess from '@/components/WebChess';
import NavHeader from '@/components/NavHeader';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ChessPage = () => {
  const [showGame, setShowGame] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const handleStartGame = () => {
    setShowGame(true);
  };

  const handleBackgroundImageUpload = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 text-white"
      style={backgroundImage ? { 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      <NavHeader title="𝝨 CHESS" />
      
      <main className="flex-1 py-4 px-4 flex flex-col items-center justify-center">
        {!showGame ? (
          <div className="max-w-2xl w-full bg-gray-800/80 p-8 rounded-lg shadow-xl backdrop-blur">
            <h1 className="text-4xl font-bold text-center mb-6">𝝨 CHESS</h1>
            <p className="text-gray-300 text-center mb-8">
              Welcome to 𝝨 CHESS, a modern chess game with AI capabilities.
              Choose an option below to get started.
            </p>

            <Tabs defaultValue="play" className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="play">Play</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
              </TabsList>
              <TabsContent value="play" className="space-y-4 pt-4">
                <Button 
                  onClick={handleStartGame} 
                  className="w-full py-6 text-lg font-bold"
                >
                  Start Web Game
                </Button>
                <div className="mt-4 p-4 border border-gray-600 rounded-lg">
                  <h3 className="font-medium mb-2">Desktop Version</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    You can also play 𝝨 CHESS as a desktop application.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('/chess_game.py', '_blank')}
                  >
                    Download Python Source
                  </Button>
                  <p className="text-gray-400 text-xs mt-2">
                    Run the Python source with PyQt5 installed, or use build_exe.py to create an executable.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="customize" className="space-y-4 pt-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Background Image</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Choose a custom background for your game.
                  </p>
                  <ImageUploader 
                    onImageUploaded={handleBackgroundImageUpload} 
                    label="Upload Background" 
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                𝝨 CHESS features both a web version and a desktop application.
              </p>
            </div>
          </div>
        ) : (
          <WebChess />
        )}
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-400">
        <p>𝝨 CHESS - Web & Desktop Version</p>
      </footer>
    </div>
  );
};

export default ChessPage;

import React, { useRef, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Character } from '../types/character';
import { Upload, Map, ChevronDown, ChevronUp, X, Move, RotateCcw, Maximize, Lock, Unlock } from 'lucide-react';
import { Modal } from './Modal';

interface MapSystemProps {
  characters: Character[];
}

interface CharacterModelProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelFile: File;
  onSelect: (event: THREE.Event) => void;
  isSelected: boolean;
  transformMode: TransformMode;
  onPositionChange: (position: [number, number, number]) => void;
  onRotationChange: (rotation: [number, number, number]) => void;
  onScaleChange: (scale: [number, number, number]) => void;
}

interface MapData {
  id: string;
  name: string;
  file: File;
  scale: number;
}

interface ModelData {
  id: string;
  name: string;
  file: File;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

type TransformMode = 'translate' | 'rotate' | 'scale';

const MapPlane: React.FC<{ map: MapData }> = ({ map }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        setTexture(texture);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(map.file);
  }, [map.file]);

  if (!texture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[10 * map.scale, 10 * map.scale]} />
      <meshBasicMaterial map={texture} transparent opacity={0.8} />
    </mesh>
  );
};

const CharacterModel: React.FC<CharacterModelProps> = ({
  position,
  rotation,
  scale,
  modelFile,
  onSelect,
  isSelected,
  transformMode,
  onPositionChange,
  onRotationChange,
  onScaleChange
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>();
  const { camera } = useThree();

  React.useEffect(() => {
    const url = URL.createObjectURL(modelFile);
    setObjectUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [modelFile]);

  if (!objectUrl) return null;

  const obj = useLoader(OBJLoader, objectUrl);

  return (
    <>
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={onSelect}
      >
        <primitive 
          object={obj} 
          position={[0, 0, 0]}
        />
        {isSelected && (
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#00ffe1" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          size={0.5}
          onObjectChange={(e) => {
            const obj = e.target.object;
            onPositionChange([obj.position.x, obj.position.y, obj.position.z]);
            onRotationChange([obj.rotation.x, obj.rotation.y, obj.rotation.z]);
            onScaleChange([obj.scale.x, obj.scale.y, obj.scale.z]);
          }}
        />
      )}
    </>
  );
};

export const MapSystem: React.FC<MapSystemProps> = ({ characters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([10, 10, 10]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [models, setModels] = useState<ModelData[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [newMapFile, setNewMapFile] = useState<File | null>(null);
  const [newMapName, setNewMapName] = useState('');
  const [newMapScale, setNewMapScale] = useState(1);
  const [newModelFile, setNewModelFile] = useState<File | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [isMapLocked, setIsMapLocked] = useState(false);
  const orbitControlsRef = useRef<any>();

  const handleMapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setNewMapFile(file);
      } else {
        alert('Por favor, selecione um arquivo de imagem válido.');
      }
    }
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.obj')) {
        setNewModelFile(file);
      } else {
        alert('Por favor, selecione um arquivo .obj válido.');
      }
    }
  };

  const handleAddMap = () => {
    if (!newMapFile || !newMapName.trim()) return;

    const newMap: MapData = {
      id: crypto.randomUUID(),
      name: newMapName.trim(),
      file: newMapFile,
      scale: newMapScale
    };

    setMaps(prev => [...prev, newMap]);
    setSelectedMap(newMap);
    setNewMapFile(null);
    setNewMapName('');
    setNewMapScale(1);
    setShowMapModal(false);
  };

  const handleAddModel = () => {
    if (!newModelFile || !newModelName.trim()) return;

    const newModel: ModelData = {
      id: crypto.randomUUID(),
      name: newModelName.trim(),
      file: newModelFile,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5]
    };

    setModels(prev => [...prev, newModel]);
    setNewModelFile(null);
    setNewModelName('');
    setShowModelModal(false);
  };

  const handleRemoveMap = (id: string) => {
    setMaps(prev => prev.filter(map => map.id !== id));
    if (selectedMap?.id === id) {
      setSelectedMap(null);
    }
  };

  const handleRemoveModel = (id: string) => {
    setModels(prev => prev.filter(model => model.id !== id));
    setSelectedModels(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleModelPositionChange = (id: string, position: [number, number, number]) => {
    setModels(prev => prev.map(model => 
      selectedModels.has(model.id) ? { ...model, position } : model
    ));
  };

  const handleModelRotationChange = (id: string, rotation: [number, number, number]) => {
    setModels(prev => prev.map(model => 
      selectedModels.has(model.id) ? { ...model, rotation } : model
    ));
  };

  const handleModelScaleChange = (id: string, scale: [number, number, number]) => {
    setModels(prev => prev.map(model => 
      selectedModels.has(model.id) ? { ...model, scale } : model
    ));
  };

  const handleModelSelect = (id: string, event: THREE.Event) => {
    event.stopPropagation();
    
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (event.shiftKey) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleBackgroundClick = (e: THREE.Event) => {
    if (e.object && (e.object.type === 'GridHelper' || e.object.type === 'Plane')) {
      setSelectedModels(new Set());
    }
  };

  // Update orbit controls enabled state
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !isMapLocked && selectedModels.size === 0;
    }
  }, [isMapLocked, selectedModels]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
      >
        <Map size={20} />
        <span>Abrir Mapa</span>
        <ChevronUp size={16} />
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-[rgba(0,20,40,0.95)] rounded-xl border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1] overflow-hidden flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-[#00ffe1]/30">
        <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1] flex items-center gap-2">
          <Map size={24} />
          Mapa Tático
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMapLocked(!isMapLocked)}
            className={`flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-1.5 hover:bg-[#2a2a2a] transition-colors ${
              isMapLocked ? 'bg-[#2a2a2a]' : ''
            }`}
            title={isMapLocked ? 'Desbloquear Mapa' : 'Bloquear Mapa'}
          >
            {isMapLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg border border-[#00ffe1] p-1">
            <button
              onClick={() => setTransformMode('translate')}
              className={`p-2 rounded ${
                transformMode === 'translate'
                  ? 'bg-[#00ffe1] text-[#1a1a1a]'
                  : 'text-[#00ffe1] hover:bg-[#2a2a2a]'
              }`}
              title="Mover"
            >
              <Move size={16} />
            </button>
            <button
              onClick={() => setTransformMode('rotate')}
              className={`p-2 rounded ${
                transformMode === 'rotate'
                  ? 'bg-[#00ffe1] text-[#1a1a1a]'
                  : 'text-[#00ffe1] hover:bg-[#2a2a2a]'
              }`}
              title="Rotacionar"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setTransformMode('scale')}
              className={`p-2 rounded ${
                transformMode === 'scale'
                  ? 'bg-[#00ffe1] text-[#1a1a1a]'
                  : 'text-[#00ffe1] hover:bg-[#2a2a2a]'
              }`}
              title="Escalar"
            >
              <Maximize size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowMapModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-1.5 hover:bg-[#2a2a2a] transition-colors"
          >
            <Upload size={16} />
            <span>Adicionar Mapa</span>
          </button>
          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-1.5 hover:bg-[#2a2a2a] transition-colors"
          >
            <Upload size={16} />
            <span>Adicionar Modelo</span>
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[#00ffe1] hover:text-[#00ff88] transition-colors"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[300px_1fr] divide-x divide-[#00ffe1]/30">
        {/* Sidebar */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Maps List */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[#00ffe1]">Mapas</h3>
            {maps.length === 0 ? (
              <p className="text-[#00ffe1]/50 text-sm">Nenhum mapa adicionado</p>
            ) : (
              maps.map(map => (
                <div
                  key={map.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                    selectedMap?.id === map.id
                      ? 'bg-[#00ffe1]/10 border-[#00ffe1]'
                      : 'border-transparent hover:border-[#00ffe1]/50'
                  }`}
                >
                  <button
                    onClick={() => setSelectedMap(map)}
                    className="flex-1 text-left text-[#00ffe1]"
                  >
                    {map.name}
                  </button>
                  <button
                    onClick={() => handleRemoveMap(map.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Models List */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[#00ffe1]">Modelos</h3>
            {models.length === 0 ? (
              <p className="text-[#00ffe1]/50 text-sm">Nenhum modelo adicionado</p>
            ) : (
              models.map(model => (
                <div
                  key={model.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                    selectedModels.has(model.id)
                      ? 'bg-[#00ffe1]/10 border-[#00ffe1]'
                      : 'border-transparent hover:border-[#00ffe1]/50'
                  }`}
                >
                  <button
                    onClick={(e) => handleModelSelect(model.id, e as any)}
                    className="flex-1 text-left text-[#00ffe1]"
                  >
                    {model.name}
                  </button>
                  <button
                    onClick={() => handleRemoveModel(model.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map View */}
        <div className="p-4">
          <div className="w-full h-full rounded-lg overflow-hidden border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]">
            <Canvas shadows onClick={handleBackgroundClick}>
              <PerspectiveCamera
                makeDefault
                position={cameraPosition}
                fov={75}
              />
              <OrbitControls
                ref={orbitControlsRef}
                enablePan
                enableZoom
                enableRotate
                onChange={(e) => {
                  const pos = e.target.object.position;
                  setCameraPosition([pos.x, pos.y, pos.z]);
                }}
              />
              
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
              />

              {/* Grid */}
              <Grid
                infiniteGrid
                cellSize={1}
                cellThickness={0.5}
                cellColor="#00ffe1"
                sectionSize={3}
                sectionThickness={1}
                sectionColor="#004455"
                fadeDistance={30}
                fadeStrength={1}
              />

              {/* Selected Map */}
              {selectedMap && (
                <MapPlane map={selectedMap} />
              )}

              {/* Custom Models */}
              {models.map((model) => (
                <CharacterModel
                  key={model.id}
                  position={model.position}
                  rotation={model.rotation}
                  scale={model.scale}
                  modelFile={model.file}
                  onSelect={(e) => handleModelSelect(model.id, e)}
                  isSelected={selectedModels.has(model.id)}
                  transformMode={transformMode}
                  onPositionChange={(position) => handleModelPositionChange(model.id, position)}
                  onRotationChange={(rotation) => handleModelRotationChange(model.id, rotation)}
                  onScaleChange={(scale) => handleModelScaleChange(model.id, scale)}
                />
              ))}
            </Canvas>
          </div>
        </div>
      </div>

      {/* Add Map Modal */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title="Adicionar Mapa"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[#00ffe1] mb-1">Nome do Mapa</label>
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              placeholder="Ex: Dungeon Level 1"
            />
          </div>

          <div>
            <label className="block text-[#00ffe1] mb-1">Arquivo do Mapa</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMapFileChange}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-[#00ffe1] mb-1">Escala</label>
            <input
              type="number"
              value={newMapScale}
              onChange={(e) => setNewMapScale(Number(e.target.value))}
              min={0.1}
              step={0.1}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddMap}
              disabled={!newMapFile || !newMapName.trim()}
              className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Model Modal */}
      <Modal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        title="Adicionar Modelo 3D"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[#00ffe1] mb-1">Nome do Modelo</label>
            <input
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              placeholder="Ex: Goblin"
            />
          </div>

          <div>
            <label className="block text-[#00ffe1] mb-1">Arquivo do Modelo (.obj)</label>
            <input
              type="file"
              accept=".obj"
              onChange={handleModelFileChange}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddModel}
              disabled={!newModelFile || !newModelName.trim()}
              className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
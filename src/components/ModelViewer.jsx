import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function ModelViewer() {
  const gltf = useLoader(GLTFLoader, '/models/ar00.glb');
  
  // ...existing code...
}

export default ModelViewer;
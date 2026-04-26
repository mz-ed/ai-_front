import { Float, MeshDistortMaterial, ContactShadows, Environment } from '@react-three/drei';

function Scene3D({ meshData, viewMode }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 250]} fov={40} />
      <Environment preset="city" />
      
      {/* Lighting for "Glow" effect */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f2ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#7000ff" />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Stage intensity={0.5} environment="city" adjustCamera={false}>
          {meshData?.roi && (
            <MedicalMesh 
              data={meshData.roi} 
              color="#00d4ff" 
              opacity={0.8} 
              wireframe={viewMode === 'wireframe'} 
            />
          )}
        </Stage>
      </Float>

      {/* Grid and Atmosphere */}
      <ContactShadows opacity={0.4} scale={10} blur={2} far={10} resolution={256} color="#000000" />
      <gridHelper args={[500, 50, '#1e293b', '#020617']} position={[0, -80, 0]} />
      
      <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}
import {
  Box,
  CubeCamera,
  Environment,
  OrbitControls,
  Sphere,
  useEnvironment,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import "./App.css";
import { useControls } from "leva";
import { Group } from "three";
import { ReactNode, useEffect, useRef, useState } from "react";

function ReflectiveSphere(): JSX.Element {
  const tweakableProps = useControls({
    roughness: { value: 0, min: 0, max: 1 },
    metalness: { value: 1, min: 0, max: 1 },
  });

  return (
    <Sphere args={[1, 256, 256]}>
      <meshStandardMaterial {...tweakableProps} />
    </Sphere>
  );
}

function Rotator({ children }: { children: ReactNode }): JSX.Element {
  const groupRef = useRef<Group>(null!);
  useFrame(() => {
    groupRef.current.children.forEach((child) => {
      if (child.isObject3D) {
        child.rotateX(0.02);
        child.rotateY(0.02);
      }
    });
  });
  return <group ref={groupRef}>{children}</group>;
}

function ThreeScene() {
  const [key, setKey] = useState(0);
  const [cubeMap, setCubeMap] = useState("ub");
  const image = new Image();
  image.src = `/${cubeMap}-cube.png`;
  image.style.position = "absolute";
  image.style.bottom = "0";
  image.style.left = "0";
  image.style.width = "200px";

  useEffect(() => {
    image.src = `/${cubeMap}-cube.png`;
    document.body.appendChild(image);
    return () => {
      document.body.removeChild(image);
    };
  }, [cubeMap]);
  useControls("Environment", {
    textureMap: {
      value: "ub",
      options: {
        UB: "ub",
        Garden: "garden",
        Cambridge: "cambridge",
      },
      onChange: (v) => {
        setKey((prev) => prev + 1);
        setCubeMap(v);
      },
    },
  });

  const envMap = useEnvironment({
    files: ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"].map(
      (x) => `/${cubeMap}/${x}`
    ),
  });

  return (
    <>
      <ambientLight />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-3, -3, 2]} />
      <OrbitControls />
      <Environment key={key} map={envMap} background />
      <CubeCamera>
        {/* @ts-ignore */}
        {(texture) => (
          <>
            <Environment key={key} map={texture} />
            <ReflectiveSphere />
          </>
        )}
      </CubeCamera>
      <Rotator>
        <Box position={[0, 0, 5]}>
          <meshStandardMaterial color='red' />
        </Box>

        <Box position={[-1, 3, 5]}>
          <meshStandardMaterial color='purple' />
        </Box>
      </Rotator>
    </>
  );
}

function App() {
  return (
    <div className='h-screen App'>
      <Canvas>
        <ThreeScene />
      </Canvas>
    </div>
  );
}

export default App;

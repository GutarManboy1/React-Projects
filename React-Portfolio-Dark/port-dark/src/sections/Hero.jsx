import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { AmbientLight } from "three";
import { DirectionalLight } from "three";
import CanvasLoader from "../components/CanvasLoader";
import Computer from "../components/Computer";

const Hero = () => {
  return (
    <section className="min-h-screen w-full flex flex-col relative">
      <div className="w-full mx-auto flex flex-col sm:mt-36 mt-20 c-space gap-3">
        <p className="sm:text-3xl text-2xl font-medium text-white text-center font-generalsans">
          {" "}
          Hey, this is Glenn <span className="waving-hand">✌️</span>{" "}
        </p>
        <p className="hero_tag text-gray_gradient">
          I Break Stuff and Create Digital Experiences!
        </p>
      </div>
      <div className="w-full h-full absolute inset-0">
        <Canvas className="w-full h-full">
          <Suspense fallback={<CanvasLoader />}>
            <PerspectiveCamera makeDefault position={[0, 0, 30]} />
            <Computer scale={0.5} position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
            <AmbientLight intensity={1} />
            <DirectionalLight position={[10, 10, 10]} intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default Hero;

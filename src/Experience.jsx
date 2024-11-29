import { BoxGeometry } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { DecalGeometry } from "src/assets/DecalGeometry.js";
export const Experience = () {
    const texture = useTexture("")
    return (
        <>
            <OrbitControls />
            <mesh>
                <BoxGeometry />
                
                <meshNormalMaterial />
                <Decal
                    debug // Makes "bounding box" of the decal visible
                    position={[0, 0, 0]} // Position of the decal
                    rotation={[0, 0, 0]} // Rotation of the decal (can be a vector or a degree in radians)
                    scale={1} // Scale of the decal
                    polygonOffset
                    polygonOffsetFactor={-1}
                >
                    <meshBasicMaterial map={texture}/>
                </Decal>
            </mesh>
        </>
    );
};
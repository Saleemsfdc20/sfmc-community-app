"use client";

import Spline from "@splinetool/react-spline";

export default function SplineScene() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-90 overflow-hidden pointer-events-none mix-blend-screen scale-[1] md:scale-100">
      <div className="w-full h-[80vh] md:w-full md:h-full relative pointer-events-auto flex items-center justify-center">
        <Spline 
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}

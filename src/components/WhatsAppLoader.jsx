"use client";

import { useEffect, useState } from "react";

export default function WhatsAppLoader({ onLoadingComplete }) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingText, setLoadingText] = useState("WhatsApp");
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const steps = [
      { text: "WhatsApp", duration: 1200 },
      { text: "Connecting...", duration: 1000 },
      { text: "Loading chats...", duration: 900 },
      { text: "Almost ready...", duration: 800 },
    ];

    let stepIndex = 0;

    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingText(steps[stepIndex].text);
        setLoadingStep(stepIndex);
        stepIndex++;
      } else {
        clearInterval(stepInterval);

        // Add a fade out effect before completing
        setTimeout(() => {
          setShowLoader(false);
          setTimeout(() => {
            if (onLoadingComplete) {
              onLoadingComplete();
            }
          }, 300);
        }, 500);
      }
    }, 800);

    return () => clearInterval(stepInterval);
  }, [onLoadingComplete]);

  return (
    <div
      className={`h-screen w-full bg-[#0b141a] flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-300 ${
        showLoader ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background pattern/texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4 max-w-sm sm:max-w-md mx-auto">
        {/* WhatsApp Logo */}
        <div className="relative">
          {/* Logo container with glow effect */}
          <div className="relative bg-[#25d366] rounded-full p-4 sm:p-6 shadow-2xl transform transition-transform duration-1000 hover:scale-105">
            <div className="absolute inset-0 bg-[#25d366] rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#25d366] to-[#128c7e] rounded-full opacity-80"></div>
            <div className="relative z-10">
              {/* WhatsApp Icon SVG */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white sm:w-16 sm:h-16"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* Animated rings around logo */}
          <div className="absolute inset-0 rounded-full border-2 border-[#25d366] animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full border border-[#25d366] animate-pulse opacity-40"></div>
          <div
            className="absolute inset-0 rounded-full border border-[#25d366] opacity-30"
            style={{
              animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
              animationDelay: "0.5s",
            }}
          ></div>
        </div>

        {/* App Title */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-wide transition-all duration-500">
            {loadingText}
          </h1>

          {/* Animated loading dots */}
          <div className="flex justify-center space-x-1.5 mt-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 bg-[#25d366] rounded-full transition-all duration-300 ${
                  loadingStep >= index
                    ? "animate-bounce opacity-100"
                    : "opacity-30"
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationDuration: "1s",
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Loading progress bar */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto">
          <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-[#25d366] to-[#128c7e] transition-all duration-1000 ease-out rounded-full shadow-lg"
              style={{
                width: `${((loadingStep + 1) / 4) * 100}%`,
                boxShadow: "0 0 10px rgba(37, 211, 102, 0.5)",
              }}
            ></div>
          </div>

          {/* Progress percentage */}
          <div className="text-center mt-3">
            <span className="text-[#25d366] text-sm font-medium">
              {Math.round(((loadingStep + 1) / 4) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom encryption notice */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-center px-4">
        <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="sm:w-4 sm:h-4"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
          <span className="font-light">End-to-end encrypted</span>
        </div>
      </div>

      {/* Additional animated background elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-[#0b141a] via-[#0b141a]/80 to-transparent"></div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @media (max-width: 640px) {
          .text-2xl {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .text-2xl {
            font-size: 1.5rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-bounce,
          .animate-pulse,
          .animate-ping {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

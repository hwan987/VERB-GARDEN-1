import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlantStage, VerbItem } from '../types';

interface PlantVisualProps {
  verb: VerbItem;
  stage: PlantStage;
  size?: 'sm' | 'md' | 'lg';
  showStageBadge?: boolean;
}

export const PlantVisual: React.FC<PlantVisualProps> = ({
  verb,
  stage,
  size = 'md',
  showStageBadge = true,
}) => {
  const { plantType, plantName, science } = verb;

  const getDimension = () => {
    switch (size) {
      case 'sm':
        return 'w-24 h-28';
      case 'lg':
        return 'w-64 h-72';
      case 'md':
      default:
        return 'w-48 h-56';
    }
  };

  const stageLabel =
    stage === 'seed'
      ? '씨앗 1/3'
      : stage === 'sprout'
      ? '새싹 2/3'
      : '꽃 3/3 (완성!)';

  const renderStageSvg = () => {
    if (stage === 'seed') {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Pot */}
          <ellipse cx="100" cy="180" rx="60" ry="12" fill="#78350f" opacity="0.4" />
          <path d="M55 130 L65 175 C66 180 134 180 135 175 L145 130 Z" fill="#b45309" />
          <ellipse cx="100" cy="130" rx="46" ry="10" fill="#78350f" />
          {/* Rich Dark Soil */}
          <ellipse cx="100" cy="132" rx="42" ry="8" fill="#451a03" />

          {/* Glowing Seed with magic sparkles */}
          <motion.g
            animate={{ scale: [1, 1.06, 1], y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          >
            {/* Plump kidney-bean shaped seed resting in soil */}
            <path
              d="M90 128 C82 120, 84 106, 96 108 C108 110, 118 122, 110 132 C104 139, 96 134, 90 128 Z"
              fill="#92400e"
              stroke="#78350f"
              strokeWidth="2.5"
            />
            <ellipse cx="98" cy="116" rx="3.5" ry="5.5" fill="#fef08a" opacity="0.6" transform="rotate(-18 98 116)" />
            {/* Hilum (seed eye) */}
            <path d="M94 121 Q95 125 98 126" stroke="#fef3c7" strokeWidth="2" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* Water droplet / gentle spark */}
          <motion.circle
            cx="100"
            cy="90"
            r="4"
            fill="#38bdf8"
            animate={{ y: [0, 8, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
          <circle cx="126" cy="112" r="2" fill="#fbbf24" opacity="0.8" />
          <circle cx="74" cy="114" r="2.5" fill="#fbbf24" opacity="0.8" />
        </svg>
      );
    }

    if (stage === 'sprout') {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Pot */}
          <ellipse cx="100" cy="180" rx="60" ry="12" fill="#78350f" opacity="0.3" />
          <path d="M55 130 L65 175 C66 180 134 180 135 175 L145 130 Z" fill="#b45309" />
          <ellipse cx="100" cy="130" rx="46" ry="10" fill="#78350f" />
          <ellipse cx="100" cy="132" rx="42" ry="8" fill="#451a03" />

          {/* Tender Young Sprout */}
          <motion.g
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1, rotate: [-1, 1, -1] }}
            transition={{
              scaleY: { type: 'spring', damping: 12 },
              rotate: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
            }}
          >
            {/* Curved Green Stem */}
            <path
              d="M100 132 Q98 100 100 78"
              stroke="#22c55e"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Left Cotyledon (떡잎) */}
            <motion.path
              d="M99 82 C82 82, 70 70, 75 62 C80 54, 96 66, 99 80 Z"
              fill="#4ade80"
              stroke="#16a34a"
              strokeWidth="2"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
            {/* Right Cotyledon (떡잎) */}
            <motion.path
              d="M101 80 C118 78, 130 68, 125 59 C120 51, 104 64, 101 78 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="2"
              animate={{ rotate: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
            {/* Tiny True Leaf Sprout in center */}
            <path
              d="M100 77 C96 68, 100 62, 100 62 C100 62, 104 68, 100 77 Z"
              fill="#86efac"
              stroke="#16a34a"
              strokeWidth="1.5"
            />
          </motion.g>
        </svg>
      );
    }

    // Stage 3: Fully bloomed flower / mature plant based on textbook plantType
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        {/* Pot / Base */}
        <ellipse cx="100" cy="182" rx="55" ry="10" fill="#78350f" opacity="0.25" />
        <path d="M60 138 L68 178 C69 182 131 182 132 178 L140 138 Z" fill="#b45309" />
        <ellipse cx="100" cy="138" rx="42" ry="8" fill="#78350f" />
        <ellipse cx="100" cy="140" rx="38" ry="6" fill="#451a03" />

        {/* Stem & Plant Body */}
        <motion.g
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
        >
          {/* Main Stem */}
          <path
            d="M100 140 Q96 100 100 65"
            stroke="#16a34a"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          {/* Plant Leaves */}
          <path
            d="M98 115 C76 115, 62 100, 72 90 C84 80, 96 105, 98 115 Z"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="1.5"
          />
          <path
            d="M102 105 C124 105, 138 90, 128 80 C116 70, 104 95, 102 105 Z"
            fill="#16a34a"
            stroke="#15803d"
            strokeWidth="1.5"
          />

          {/* Individual Flower / Fruit Rendering */}
          {renderTextbookFlower(plantType, science.flowerColor)}
        </motion.g>
      </svg>
    );
  };

  const renderTextbookFlower = (type: string, color: string) => {
    switch (type) {
      case 'sunflower': // 해바라기 (노란 꽃잎과 갈색 씨앗)
        return (
          <g transform="translate(100, 65)">
            {/* Petals ring */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-26"
                rx="7"
                ry="18"
                fill="#eab308"
                stroke="#ca8a04"
                strokeWidth="1"
                transform={`rotate(${deg})`}
              />
            ))}
            {/* Center Seed Disc */}
            <circle cx="0" cy="0" r="17" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#92400e" strokeDasharray="2,2" stroke="#d97706" />
          </g>
        );

      case 'bean': // 강낭콩 (줄기 꼬투리와 하양/연보라 꽃)
        return (
          <g transform="translate(100, 65)">
            {/* Hanging green bean pods */}
            <path
              d="M-5 10 C-20 20, -25 45, -15 55 C-10 60, -8 40, 0 20 Z"
              fill="#4ade80"
              stroke="#15803d"
              strokeWidth="2"
            />
            <path
              d="M5 2 C22 10, 28 35, 18 48 C14 53, 10 32, 2 12 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="2"
            />
            {/* Delicate flower */}
            <circle cx="-2" cy="-6" r="12" fill="#fdf4ff" stroke="#c084fc" strokeWidth="2" />
            <circle cx="5" cy="-10" r="10" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="0" cy="-6" r="4" fill="#fef08a" />
          </g>
        );

      case 'balsam': // 봉선화 (붉은 꽃잎과 뚜렷한 암술/수술)
        return (
          <g transform="translate(100, 65)">
            <ellipse cx="-12" cy="-10" rx="14" ry="12" fill="#f43f5e" />
            <ellipse cx="12" cy="-10" rx="14" ry="12" fill="#e11d48" />
            <ellipse cx="0" cy="-18" rx="13" ry="14" fill="#fb7185" />
            <ellipse cx="0" cy="5" rx="16" ry="12" fill="#be123c" />
            <circle cx="0" cy="-4" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            {/* Water droplets symbolizing stem experiment */}
            <circle cx="15" cy="8" r="2.5" fill="#38bdf8" opacity="0.9" />
          </g>
        );

      case 'dandelion': // 민들레 (풍성한 노란 꽃)
        return (
          <g transform="translate(100, 65)">
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
              <path
                key={deg}
                d="M0 0 L-3 -22 L0 -26 L3 -22 Z"
                fill="#facc15"
                stroke="#eab308"
                strokeWidth="0.8"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="7" fill="#ca8a04" />
          </g>
        );

      case 'morning_glory': // 나팔꽃 (나팔 모양 보라꽃)
        return (
          <g transform="translate(100, 65)">
            <polygon
              points="0,-28 17,-22 27,-8 25,12 12,24 -12,24 -25,12 -27,-8 -17,-22"
              fill="#8b5cf6"
              stroke="#6d28d9"
              strokeWidth="2"
            />
            <polygon
              points="0,-18 11,-14 18,-5 16,8 8,16 -8,16 -16,8 -18,-5 -11,-14"
              fill="#c084fc"
            />
            <circle cx="0" cy="0" r="10" fill="#f8fafc" />
            <circle cx="0" cy="0" r="5" fill="#fef08a" />
          </g>
        );

      case 'lily': // 백합 (순백 6장 꽃잎과 노란 꽃가루)
        return (
          <g transform="translate(100, 65)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                d="M0 0 C-10 -15, -15 -35, 0 -40 C15 -35, 10 -15, 0 0 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                transform={`rotate(${deg})`}
              />
            ))}
            {/* Stamens */}
            <line x1="0" y1="0" x2="-8" y2="-16" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="-8" cy="-16" r="3" fill="#eab308" />
            <line x1="0" y1="0" x2="8" y2="-16" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="8" cy="-16" r="3" fill="#eab308" />
            <line x1="0" y1="0" x2="0" y2="-20" stroke="#16a34a" strokeWidth="2.5" />
            <circle cx="0" cy="-20" r="3" fill="#86efac" />
          </g>
        );

      case 'lotus': // 연꽃 (분홍 꽃잎과 연잎)
        return (
          <g transform="translate(100, 65)">
            {/* Broad Floating Lotus Leaf */}
            <ellipse cx="0" cy="30" rx="36" ry="12" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
            <circle cx="3" cy="28" r="2.5" fill="#38bdf8" />
            {/* Pink petals */}
            <ellipse cx="-16" cy="-8" rx="10" ry="20" fill="#f472b6" transform="rotate(-30 -16 -8)" />
            <ellipse cx="16" cy="-8" rx="10" ry="20" fill="#f472b6" transform="rotate(30 16 -8)" />
            <ellipse cx="-8" cy="-14" rx="9" ry="24" fill="#ec4899" transform="rotate(-15 -8 -14)" />
            <ellipse cx="8" cy="-14" rx="9" ry="24" fill="#ec4899" transform="rotate(15 8 -14)" />
            <ellipse cx="0" cy="-16" rx="10" ry="26" fill="#fbcfe8" />
            <circle cx="0" cy="-5" r="7" fill="#facc15" />
          </g>
        );

      case 'cactus': // 선인장 (가시와 꼭대기 분홍 꽃)
        return (
          <g transform="translate(100, 75)">
            {/* Cactus body */}
            <rect x="-18" y="-30" width="36" height="55" rx="18" fill="#10b981" stroke="#047857" strokeWidth="2.5" />
            {/* Rib lines */}
            <line x1="-7" y1="-28" x2="-7" y2="23" stroke="#047857" strokeWidth="1.5" />
            <line x1="7" y1="-28" x2="7" y2="23" stroke="#047857" strokeWidth="1.5" />
            {/* Spines */}
            <line x1="-19" y1="-10" x2="-26" y2="-12" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1="-19" y1="5" x2="-26" y2="3" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1="19" y1="-10" x2="26" y2="-12" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1="19" y1="5" x2="26" y2="3" stroke="#fbbf24" strokeWidth="1.5" />
            {/* Flower on top */}
            <circle cx="0" cy="-34" r="11" fill="#f43f5e" />
            <circle cx="0" cy="-34" r="6" fill="#fbbf24" />
          </g>
        );

      case 'tomato': // 토마토 (탐스러운 빨간 방울토마토 열매)
        return (
          <g transform="translate(100, 65)">
            {/* Yellow star flower */}
            <polygon
              points="0,-22 4,-12 14,-10 6,-3 8,7 0,2 -8,7 -6,-3 -14,-10 -4,-12"
              fill="#eab308"
            />
            {/* Ripe red tomatoes */}
            <circle cx="-16" cy="10" r="14" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <ellipse cx="-20" cy="5" rx="3" ry="5" fill="#fca5a5" opacity="0.8" transform="rotate(-30)" />
            {/* Sepals on tomato */}
            <polygon points="-16,-4 -13,0 -16,4 -19,0" fill="#15803d" />

            <circle cx="14" cy="18" r="13" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            <ellipse cx="10" cy="14" rx="2.5" ry="4" fill="#fca5a5" opacity="0.8" transform="rotate(-30)" />
          </g>
        );

      case 'maple': // 단풍나무 (붉은 단풍잎과 날개 씨앗)
        return (
          <g transform="translate(100, 60)">
            {/* Winged seeds (samara / helicopter wings) */}
            <path
              d="M0 20 C-15 15, -30 25, -35 40 C-30 38, -15 32, 0 25 Z"
              fill="#ca8a04"
              stroke="#a16207"
              strokeWidth="1.5"
            />
            <path
              d="M0 20 C15 15, 30 25, 35 40 C30 38, 15 32, 0 25 Z"
              fill="#ca8a04"
              stroke="#a16207"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="22" r="4" fill="#78350f" />
            {/* 5-pointed crimson maple leaf */}
            <polygon
              points="0,-35 7,-18 25,-25 18,-8 34,5 16,10 20,28 4,20 -4,20 -20,28 -16,10 -34,5 -18,-8 -25,-25 -7,-18"
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="2"
            />
          </g>
        );

      case 'pine': // 소나무 (푸른 바늘잎과 솔방울)
        return (
          <g transform="translate(100, 60)">
            {/* Pinecone */}
            <ellipse cx="15" cy="15" rx="9" ry="15" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <line x1="8" y1="10" x2="22" y2="10" stroke="#b45309" strokeWidth="1.5" />
            <line x1="8" y1="16" x2="22" y2="16" stroke="#b45309" strokeWidth="1.5" />
            {/* Needle clusters */}
            <path
              d="M0 0 L-25 -20 M0 0 L-30 -5 M0 0 L-20 -30 M0 0 L0 -35 M0 0 L20 -30 M0 0 L30 -5 M0 0 L25 -20"
              stroke="#047857"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        );

      case 'canola': // 유채꽃 (밝은 노란 꽃송이 무리)
        return (
          <g transform="translate(100, 60)">
            {[-12, 12].map((x, i) => (
              <g key={i} transform={`translate(${x}, ${i * 8 - 4})`}>
                <circle cx="0" cy="-6" r="6" fill="#eab308" />
                <circle cx="-6" cy="0" r="6" fill="#facc15" />
                <circle cx="6" cy="0" r="6" fill="#facc15" />
                <circle cx="0" cy="6" r="6" fill="#eab308" />
                <circle cx="0" cy="0" r="3" fill="#ca8a04" />
              </g>
            ))}
            <g transform="translate(0, -18)">
              <circle cx="0" cy="-6" r="7" fill="#fde047" />
              <circle cx="-6" cy="0" r="7" fill="#facc15" />
              <circle cx="6" cy="0" r="7" fill="#facc15" />
              <circle cx="0" cy="6" r="7" fill="#fde047" />
              <circle cx="0" cy="0" r="3.5" fill="#ca8a04" />
            </g>
          </g>
        );

      case 'cattail': // 부들 (핫도그 모양 이삭)
        return (
          <g transform="translate(100, 60)">
            {/* Brown cylindrical spike */}
            <rect x="-8" y="-35" width="16" height="42" rx="8" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <line x1="0" y1="-35" x2="0" y2="-45" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tall slender leaves */}
            <path d="M-15 40 Q-25 -10 -15 -40" stroke="#16a34a" strokeWidth="3" fill="none" />
            <path d="M15 40 Q25 -10 15 -40" stroke="#16a34a" strokeWidth="3" fill="none" />
          </g>
        );

      case 'rose_of_sharon': // 무궁화 (분홍 통꽃과 암술대)
        return (
          <g transform="translate(100, 60)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-20"
                rx="14"
                ry="18"
                fill="#f472b6"
                stroke="#db2777"
                strokeWidth="1.5"
                transform={`rotate(${deg})`}
              />
            ))}
            {/* Crimson center star */}
            <circle cx="0" cy="0" r="10" fill="#be123c" />
            {/* Pistil column */}
            <line x1="0" y1="0" x2="0" y2="-22" stroke="#fef08a" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="0" cy="-22" r="3" fill="#eab308" />
          </g>
        );

      default: // 범용 단아한 꽃
        return (
          <g transform="translate(100, 60)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-20"
                rx="8"
                ry="16"
                fill={color || '#f43f5e'}
                stroke="#fda4af"
                strokeWidth="1"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="10" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          </g>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className={`relative ${getDimension()} flex items-center justify-center`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full h-full flex items-center justify-center"
          >
            {renderStageSvg()}
          </motion.div>
        </AnimatePresence>
      </div>

      {showStageBadge && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{stageLabel}</span>
          </div>
          <span className="text-xs text-slate-700 font-medium">
            {plantName} ({verb.plantEnglish})
          </span>
        </div>
      )}
    </div>
  );
};

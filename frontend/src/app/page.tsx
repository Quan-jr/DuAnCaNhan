'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Calendar as CalendarIcon, 
  ListTodo, 
  Timer, 
  Video, 
  Sparkles, 
  Search, 
  Play, 
  Pause, 
  Maximize2, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Heart,
  Plus,
  Trash2,
  Upload,
  Music,
  Share2,
  Scissors,
  Wand2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Settings,
  Sliders,
  X,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/shared/Sidebar';

interface PhotoSticker {
  id: string;
  name: string;
  src: string;
}

const DEFAULT_STICKERS: PhotoSticker[] = [
  { id: '1', name: 'Hatsune Miku 01', src: '/images/hatsune_miku_bg.jpg' },
  { id: '2', name: 'Đồi cỏ Ghibli', src: '/images/ghibli_hill_bg.jpg' },
  { id: '3', name: 'Quán Cafe Mưa', src: '/images/rainy_cafe_bg.jpg' },
  { id: '4', name: 'Lửa trại Đêm', src: '/images/night_campfire_bg.jpg' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mascotInputRef = useRef<HTMLInputElement>(null);
  const mascotAutoBgInputRef = useRef<HTMLInputElement>(null);

  // Clock state
  const [timeStr, setTimeStr] = useState('02:30');
  const [dateStr, setDateStr] = useState('Monday 05/27');

  // Music state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Photo Sticker & Wallpaper state
  const [stickers, setStickers] = useState<PhotoSticker[]>(DEFAULT_STICKERS);
  const [activeStickerIndex, setActiveStickerIndex] = useState(0);
  const [activeWallpaper, setActiveWallpaper] = useState<string>('/images/hatsune_miku_bg.jpg');

  // Character Cutout Mascot state
  const [customMascot, setCustomMascot] = useState<string>('/images/anime_mascot_cutout.png');
  const [rawMascot, setRawMascot] = useState<string>('');
  const [strokeGlowEnabled, setStrokeGlowEnabled] = useState<boolean>(true);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);
  const [mascotScale, setMascotScale] = useState<number>(1.35); // Big default scale for prominent display
  const [mascotPos, setMascotPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingMascot, setIsDraggingMascot] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });
  const [showHomeSettings, setShowHomeSettings] = useState<boolean>(false);
  const [settingTab, setSettingTab] = useState<'mascot' | 'stickers'>('mascot');

  useEffect(() => {
    const savedStickers = localStorage.getItem('custom_photo_stickers');
    if (savedStickers) {
      try {
        setStickers(JSON.parse(savedStickers));
      } catch (e) {}
    }

    const savedWallpaper = localStorage.getItem('active_app_wallpaper');
    if (savedWallpaper) {
      setActiveWallpaper(savedWallpaper);
    }

    const savedMascot = localStorage.getItem('custom_character_mascot');
    if (savedMascot) {
      setCustomMascot(savedMascot);
    }

    const savedRaw = localStorage.getItem('raw_character_mascot');
    if (savedRaw) {
      setRawMascot(savedRaw);
    }

    const savedPos = localStorage.getItem('custom_character_pos');
    if (savedPos) {
      try {
        setMascotPos(JSON.parse(savedPos));
      } catch (e) {}
    }

    const savedScale = localStorage.getItem('custom_character_scale');
    if (savedScale) {
      try {
        const parsed = parseFloat(savedScale);
        if (!isNaN(parsed)) setMascotScale(parsed);
      } catch (e) {}
    }

    const handleWallpaperUpdate = () => {
      const updated = localStorage.getItem('active_app_wallpaper');
      if (updated) {
        setActiveWallpaper(updated);
      }
    };

    window.addEventListener('wallpaper_updated', handleWallpaperUpdate);
    window.addEventListener('storage', handleWallpaperUpdate);
    return () => {
      window.removeEventListener('wallpaper_updated', handleWallpaperUpdate);
      window.removeEventListener('storage', handleWallpaperUpdate);
    };
  }, []);

  const updateMascotScale = (scale: number) => {
    setMascotScale(scale);
    localStorage.setItem('custom_character_scale', scale.toString());
  };

  const handleMouseDownMascot = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingMascot(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: mascotPos.x,
      startY: mascotPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingMascot) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setMascotPos({
        x: dragStartRef.current.startX + dx,
        y: dragStartRef.current.startY + dy,
      });
    };

    const handleMouseUp = () => {
      if (isDraggingMascot) {
        setIsDraggingMascot(false);
        localStorage.setItem('custom_character_pos', JSON.stringify(mascotPos));
      }
    };

    if (isDraggingMascot) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingMascot, mascotPos]);

  const changeWallpaper = (src: string) => {
    setActiveWallpaper(src);
    localStorage.setItem('active_app_wallpaper', src);
    window.dispatchEvent(new Event('wallpaper_updated'));
  };

  // Helper function: Safe & Precise AI Background Removal with Character Protection (Buns, hands, skin, hair protected)
  const removeBgFromImage = async (imageSrc: string, customThreshold?: number): Promise<string> => {
    let geminiData: any = null;
    try {
      const res = await fetch('/api/ai/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageSrc }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.geminiAnalysis) {
          geminiData = json.geminiAnalysis;
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local smart matting:', e);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const MAX_SIZE = 900;
        let width = img.width;
        let height = img.height;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 0. Automatic Transparency Detector: Check if image is ALREADY a transparent PNG cutout!
        let transparentPixelCount = 0;
        const totalPixels = width * height;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 200) {
            transparentPixelCount++;
          }
        }

        // If image already has transparent background (> 1.5% pixels transparent), keep 100% untouched!
        if (transparentPixelCount > totalPixels * 0.015) {
          console.log('Image is already a transparent PNG cutout. Preserving original PNG without modification.');
          resolve(imageSrc);
          return;
        }

        // 1. Gemini bounding box validation (only clear area outside if valid)
        if (geminiData?.box_2d && Array.isArray(geminiData.box_2d) && geminiData.box_2d.length === 4) {
          const [ymin, xmin, ymax, xmax] = geminiData.box_2d;
          if (ymax > ymin + 150 && xmax > xmin + 150) {
            const minY = Math.max(0, Math.floor((ymin / 1000) * height - height * 0.04));
            const minX = Math.max(0, Math.floor((xmin / 1000) * width - width * 0.04));
            const maxY = Math.min(height, Math.ceil((ymax / 1000) * height + height * 0.04));
            const maxX = Math.min(width, Math.ceil((xmax / 1000) * width + width * 0.04));

            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                if (x < minX || x > maxX || y < minY || y > maxY) {
                  const idx = (y * width + x) * 4;
                  data[idx + 3] = 0;
                }
              }
            }
          }
        }

        // 2. Corner background sampling (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
        const cornerSamples: [number, number, number][] = [];
        const sampleSize = Math.min(12, Math.floor(width / 10));
        
        for (let y = 0; y < sampleSize; y++) {
          for (let x = 0; x < sampleSize; x++) {
            const idx1 = (y * width + x) * 4;
            cornerSamples.push([data[idx1], data[idx1 + 1], data[idx1 + 2]]);
            const idx2 = (y * width + (width - 1 - x)) * 4;
            cornerSamples.push([data[idx2], data[idx2 + 1], data[idx2 + 2]]);
          }
        }

        let avgR = 0, avgG = 0, avgB = 0;
        let whiteSquareCount = 0;
        let greySquareCount = 0;

        cornerSamples.forEach(([r, g, b]) => {
          avgR += r; avgG += g; avgB += b;
          if (r > 215 && g > 215 && b > 215) {
            whiteSquareCount++;
          } else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 130 && r < 235) {
            greySquareCount++;
          }
        });

        avgR = Math.round(avgR / cornerSamples.length);
        avgG = Math.round(avgG / cornerSamples.length);
        avgB = Math.round(avgB / cornerSamples.length);

        const isFakeCheckerboard = whiteSquareCount > 4 && greySquareCount > 4;
        const threshold = customThreshold ?? (isFakeCheckerboard ? 22 : 28);

        let bgR = geminiData?.bg_color_rgb?.[0] ?? avgR;
        let bgG = geminiData?.bg_color_rgb?.[1] ?? avgG;
        let bgB = geminiData?.bg_color_rgb?.[2] ?? avgB;

        // 3. Safe Edge-only BFS Flood Fill (NEVER flood into character interior or white objects like buns/hands)
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        for (let x = 0; x < width; x++) {
          queue.push(x, 0, x, height - 1);
          visited[0 * width + x] = 1;
          visited[(height - 1) * width + x] = 1;
        }
        for (let y = 0; y < height; y++) {
          queue.push(0, y, width - 1, y);
          visited[y * width + 0] = 1;
          visited[y * width + (width - 1)] = 1;
        }

        let head = 0;
        while (head < queue.length) {
          const cx = queue[head++];
          const cy = queue[head++];
          const idx = (cy * width + cx) * 4;

          if (data[idx + 3] === 0) {
            const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIndex = ny * width + nx;
                if (!visited[nIndex]) {
                  visited[nIndex] = 1;
                  queue.push(nx, ny);
                }
              }
            }
            continue;
          }

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Character Protection Filters: Never erase flesh skin, peaches/buns, red dresses, blue hair
          const isFleshOrPeach = r > 200 && g > 140 && b > 110 && (r > b + 10);
          const isWarmYellow = r > 190 && g > 150 && b < 165;
          const isRedDress = r > 150 && r > g + 35 && r > b + 35;
          const isBlueHair = b > 130 && b > r + 15;

          if (isFleshOrPeach || isWarmYellow || isRedDress || isBlueHair) {
            // Protected character region: Stop flood fill instantly!
            continue;
          }

          // Perceptual color distance to background
          const colorDist = Math.sqrt(
            0.3 * (r - bgR) ** 2 + 0.59 * (g - bgG) ** 2 + 0.11 * (b - bgB) ** 2
          );

          // Detect neutral grey / white tiles of fake PNG checkerboard grid
          const isWhiteTile = r > 220 && g > 220 && b > 220;
          const isGreyTile = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20 && r > 135 && r < 235;
          const isCheckerboardTile = isFakeCheckerboard && (isWhiteTile || isGreyTile);

          if (colorDist <= threshold || isCheckerboardTile) {
            data[idx + 3] = 0; // Make transparent

            const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIndex = ny * width + nx;
                if (!visited[nIndex]) {
                  visited[nIndex] = 1;
                  queue.push(nx, ny);
                }
              }
            }
          }
        }

        // 4. Pass 2: Anti-Aliasing Defringing
        const copyData = new Uint8Array(data);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            if (copyData[idx + 3] > 0) {
              let transCount = 0;
              let innerR = 0, innerG = 0, innerB = 0, innerCount = 0;

              const checkNeighbor = (nx: number, ny: number) => {
                const nIdx = (ny * width + nx) * 4;
                if (copyData[nIdx + 3] === 0) {
                  transCount++;
                } else {
                  innerR += copyData[nIdx];
                  innerG += copyData[nIdx + 1];
                  innerB += copyData[nIdx + 2];
                  innerCount++;
                }
              };

              checkNeighbor(x + 1, y);
              checkNeighbor(x - 1, y);
              checkNeighbor(x, y + 1);
              checkNeighbor(x, y - 1);

              if (transCount >= 1) {
                const r = copyData[idx];
                const g = copyData[idx + 1];
                const b = copyData[idx + 2];

                const brightness = (r + g + b) / 3;
                const bgBrightness = (bgR + bgG + bgB) / 3;

                if (bgBrightness < 80 && brightness < 50 && innerCount > 0) {
                  data[idx] = Math.round(innerR / innerCount);
                  data[idx + 1] = Math.round(innerG / innerCount);
                  data[idx + 2] = Math.round(innerB / innerCount);
                  data[idx + 3] = 255;
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  const handleMascotUpload = (e: React.ChangeEvent<HTMLInputElement>, autoRemove: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingBg(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const src = evt.target?.result as string;
      if (src) {
        setRawMascot(src);
        try {
          localStorage.setItem('raw_character_mascot', src);
        } catch (e) {}

        if (autoRemove) {
          try {
            const cleanMascot = await removeBgFromImage(src, 40);
            setCustomMascot(cleanMascot);
            try {
              localStorage.setItem('custom_character_mascot', cleanMascot);
            } catch (err) {}
          } catch (err) {
            setCustomMascot(src);
            localStorage.setItem('custom_character_mascot', src);
          }
        } else {
          setCustomMascot(src);
          localStorage.setItem('custom_character_mascot', src);
        }
      }
      setIsProcessingBg(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreRawMascot = () => {
    const raw = rawMascot || localStorage.getItem('raw_character_mascot');
    if (raw) {
      setCustomMascot(raw);
      localStorage.setItem('custom_character_mascot', raw);
    }
  };

  const handleManualRemoveBg = async () => {
    const raw = rawMascot || customMascot || localStorage.getItem('raw_character_mascot');
    if (!raw) return;
    setIsProcessingBg(true);
    try {
      const cleanMascot = await removeBgFromImage(raw, 40);
      setCustomMascot(cleanMascot);
      localStorage.setItem('custom_character_mascot', cleanMascot);
    } catch (e) {
      console.error('Error removing bg with Gemini:', e);
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result as string;
      if (src) {
        const newSticker: PhotoSticker = {
          id: Date.now().toString(),
          name: file.name.split('.')[0] || 'Hình nền mới',
          src,
        };
        const updated = [newSticker, ...stickers];
        setStickers(updated);
        setActiveStickerIndex(0);
        localStorage.setItem('custom_photo_stickers', JSON.stringify(updated));
        changeWallpaper(src);
      }
    };
    reader.readAsDataURL(file);
  };

  const nextSticker = () => {
    setActiveStickerIndex((prev) => (prev + 1) % stickers.length);
  };

  const prevSticker = () => {
    setActiveStickerIndex((prev) => (prev - 1 + stickers.length) % stickers.length);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const dayName = days[now.getDay()];
      const monthStr = months[now.getMonth()];
      const dateNum = String(now.getDate()).padStart(2, '0');
      setDateStr(`${dayName} ${monthStr}/${dateNum}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const userName = user?.email?.split('@')[0] || 'Expyy';

  return (
    <div className="fixed inset-0 z-10 w-screen h-screen overflow-hidden select-none bg-slate-900 font-sans">
      {/* Hidden File Input for Custom Sticker Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ── 1. Full Screen Background Wallpaper ── */}
      <img
        src={activeWallpaper || '/images/hatsune_miku_bg.jpg'}
        alt="Anime Desktop Wallpaper"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-105 filter brightness-95 transition-all duration-700"
      />

      {/* Subtle Ambient Overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

      {/* ── 2. Left Vertical Capsule Sidebar (Full height matching all pages) ── */}
      <div className="fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* ── 3. Main Center Liquid Glass Dashboard Panel ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[88vw] max-w-5xl h-[78vh] min-h-[540px] bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[3.2rem] shadow-[0_30px_90px_rgba(0,0,0,0.18)] p-8 sm:p-10 flex flex-col justify-between overflow-visible">
        {/* Glossy Reflection Highlight */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-[3.2rem]" />

        {/* ── Top Bar inside Glass Panel ── */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Top Left: Digital Clock & Date */}
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 font-mono drop-shadow-xs">
              {timeStr}
            </h1>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mt-1">
              {dateStr}
            </p>
          </div>

          {/* Top Right: User Profile Pill & Greeting & Setting Button */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="text-lg font-black text-gray-900 drop-shadow-2xs">
                Hi {userName}!!
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-white/90 shadow-md text-xs font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-[10px]">
                {userName.charAt(0).toUpperCase()}
              </span>
              <span>{userName}</span>
              <Sparkles size={13} className="text-purple-600" />
            </div>

            {/* ⚙️ SETTING BUTTON */}
            <button
              onClick={() => setShowHomeSettings(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 hover:bg-white text-gray-900 font-extrabold text-xs rounded-full border border-white/90 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Mở Cài đặt Desktop & Nhân vật"
            >
              <Settings size={14} className="text-indigo-600" />
              <span>Setting</span>
            </button>
          </div>
        </div>

        {/* ── Center Content: Left Dark Calendar + Center Photo Sticker + Right Gallery/Player ── */}
        <div className="relative z-10 grid grid-cols-12 gap-6 my-auto items-center overflow-visible">
          {/* Left Column: Dark Mini Calendar Widget */}
          <div className="col-span-4 max-w-[240px]">
            <div className="bg-[#161922]/90 backdrop-blur-2xl text-white p-5 rounded-[2rem] border border-white/10 shadow-2xl">
              <div className="text-center mb-3 border-b border-white/10 pb-2">
                <h4 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                  Tháng 09 / 2026
                </h4>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-300">
                <span className="text-slate-600">30</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                <span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span>
                <span>14</span>
                <span className="bg-white text-black font-extrabold rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-md">
                  15
                </span>
                <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
                <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span>
                <span>28</span><span>29</span><span>30</span>
              </div>
            </div>
          </div>

          {/* Center Column: Character Cutout Mascot (Hình nhân vật tách nền tràn viền) */}
          <div className="col-span-4 flex flex-col items-center justify-center relative z-30 overflow-visible">
            {/* Hidden Inputs for Mascot Upload */}
            <input
              ref={mascotInputRef}
              type="file"
              accept="image/png,image/*"
              onChange={(e) => handleMascotUpload(e, false)}
              className="hidden"
            />
            <input
              ref={mascotAutoBgInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleMascotUpload(e, true)}
              className="hidden"
            />

            <div 
              onMouseDown={handleMouseDownMascot}
              onClick={() => {
                if (!isDraggingMascot) setShowHomeSettings(true);
              }}
              className={`relative group flex flex-col items-center justify-center cursor-grab active:cursor-grabbing overflow-visible select-none ${
                isDraggingMascot ? 'cursor-grabbing' : ''
              }`}
              title="Kéo giữ chuột để di chuyển • Bấm để mở Setting"
            >
              {/* Character Cutout Container with Outlined Stroke Glow */}
              <div 
                className="relative h-[340px] sm:h-[400px] md:h-[440px] w-full flex items-end justify-center transition-all duration-300 overflow-visible"
                style={{
                  filter: strokeGlowEnabled 
                    ? 'drop-shadow(0 0 16px rgba(59, 130, 246, 0.95))'
                    : 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.35))'
                }}
              >
                <img
                  src={customMascot || '/images/anime_mascot_cutout.png'}
                  alt="Character Cutout Mascot"
                  style={{
                    transform: `translate(${mascotPos.x}px, ${mascotPos.y}px) scale(${mascotScale})`,
                    transformOrigin: 'bottom center'
                  }}
                  className={`max-h-full max-w-full object-contain transition-transform duration-75 drop-shadow-xl ${
                    isProcessingBg ? 'opacity-40 animate-pulse' : 'opacity-100'
                  }`}
                />
              </div>

              {/* Processing Spinner Overlay */}
              {isProcessingBg && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 border border-white">
                    <RefreshCw size={14} className="text-blue-600 animate-spin" />
                    <span>Đang tự động tách nền...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mini Sticker Gallery Grid & Lofi Music Player */}
          <div className="col-span-4 space-y-4">
            {/* Gallery Sticker Thumbnails Grid */}
            <div className="grid grid-cols-3 gap-2">
              {stickers.slice(0, 2).map((item, idx) => (
                <div 
                  key={item.id}
                  onClick={() => setActiveStickerIndex(idx)}
                  className={`h-24 rounded-2xl overflow-hidden border-2 shadow-md cursor-pointer transition-all hover:scale-105 ${
                    activeStickerIndex === idx ? 'border-indigo-600 scale-105 shadow-indigo-500/20' : 'border-white/70 bg-white/40'
                  }`}
                  title={item.name}
                >
                  <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}

              {/* Add New Sticker Button Frame */}
              <div 
                onClick={() => setShowHomeSettings(true)}
                className="h-24 rounded-2xl border-2 border-dashed border-white/80 bg-white/40 hover:bg-white/60 backdrop-blur-md shadow-md flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 text-gray-700"
                title="Cài đặt ảnh & sticker"
              >
                <Settings size={20} className="text-gray-800 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-800">Setting</span>
              </div>
            </div>

            {/* Bottom Right: Mini Lofi Player Glass Widget */}
            <div className="bg-white/50 backdrop-blur-2xl border border-white/80 p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Music size={16} className={isPlaying ? 'animate-spin' : ''} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">Lofi Chill Study</p>
                  <p className="text-[10px] text-gray-600 truncate">Miku • Future Vibe</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-1.5 rounded-full transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Heart size={14} className={isLiked ? 'fill-rose-500' : ''} />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. SETTING POPUP MODAL ── */}
      {showHomeSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/80 max-h-[88vh] overflow-y-auto text-gray-900">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/80 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Setting Desktop & Nhân vật</h3>
                  <p className="text-xs text-gray-500 font-medium">Quản lý nhân vật PNG, phóng to & sticker</p>
                </div>
              </div>
              <button
                onClick={() => setShowHomeSettings(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Setting Tabs */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl mb-6">
              <button
                onClick={() => setSettingTab('mascot')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  settingTab === 'mascot'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                👤 Nhân vật Mascot
              </button>
              <button
                onClick={() => setSettingTab('stickers')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  settingTab === 'stickers'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🖼️ Bộ sưu tập Sticker
              </button>
            </div>

            {/* TAB 1: MASCOT SETTINGS */}
            {settingTab === 'mascot' && (
              <div className="space-y-5">
                {/* 1. Tải ảnh PNG hoặc Tách nền */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                  <label className="text-xs font-extrabold text-gray-800 block">Tải ảnh nhân vật Mascot mới</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => mascotInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      title="Tải trực tiếp file ảnh PNG từ máy tính của bạn (Không bị vỡ nền)"
                    >
                      <Upload size={14} />
                      <span>Tải ảnh PNG từ máy</span>
                    </button>

                    <button
                      onClick={() => mascotAutoBgInputRef.current?.click()}
                      disabled={isProcessingBg}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Tải ảnh và tự động xóa nền caro / nền trắng"
                    >
                      <Scissors size={14} />
                      <span>Tải & Tự động tách nền</span>
                    </button>

                    <button
                      onClick={handleManualRemoveBg}
                      disabled={isProcessingBg}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Sử dụng Gemini AI Vision để phân tích vùng nhân vật, tách nền sắc nét & sạch viền đen"
                    >
                      <Sparkles size={14} className="text-amber-300 animate-pulse" />
                      <span>✨ Tách nền AI Gemini (Xóa viền đen)</span>
                    </button>

                    {(rawMascot || localStorage.getItem('raw_character_mascot')) && (
                      <button
                        onClick={handleRestoreRawMascot}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Dùng lại ảnh gốc đã tải lên (Hủy bỏ các phần bị xóa nhầm)"
                      >
                        <RefreshCw size={13} />
                        <span>Khôi phục ảnh gốc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Chọn nhân vật mẫu có sẵn */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                  <label className="text-xs font-extrabold text-gray-800 block">Chọn nhân vật mẫu sẵn có</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCustomMascot('/images/anime_mascot_cutout.png');
                        localStorage.setItem('custom_character_mascot', '/images/anime_mascot_cutout.png');
                      }}
                      className={`p-2.5 rounded-xl border-2 bg-white flex items-center gap-3 transition-all cursor-pointer ${
                        customMascot === '/images/anime_mascot_cutout.png' ? 'border-indigo-600 bg-indigo-50/50 scale-102 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src="/images/anime_mascot_cutout.png" alt="Miku Anime" className="h-12 w-12 object-contain" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-900">Miku Anime</p>
                        <p className="text-[10px] text-gray-500">Mascot mặc định</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomMascot('/images/jake_create_event_clean.png');
                        localStorage.setItem('custom_character_mascot', '/images/jake_create_event_clean.png');
                      }}
                      className={`p-2.5 rounded-xl border-2 bg-white flex items-center gap-3 transition-all cursor-pointer ${
                        customMascot === '/images/jake_create_event_clean.png' ? 'border-indigo-600 bg-indigo-50/50 scale-102 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src="/images/jake_create_event_clean.png" alt="Jake Dog" className="h-12 w-12 object-contain" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-900">Chú chó Jake</p>
                        <p className="text-[10px] text-gray-500">Cartoon Chibi</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Adjust Position & Zoom Controls */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-800">Điều chỉnh vị trí & Kích thước (Drag & Move)</label>
                    <button
                      onClick={() => {
                        setMascotPos({ x: 0, y: 0 });
                        updateMascotScale(1.35);
                        localStorage.removeItem('custom_character_pos');
                        localStorage.removeItem('custom_character_scale');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Đặt lại vị trí chuẩn
                    </button>
                  </div>
                  
                  {/* Zoom Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-700">
                      <span>Kích thước Zoom</span>
                      <span className="text-indigo-600 font-extrabold">{Math.round(mascotScale * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateMascotScale(Math.max(0.5, mascotScale - 0.2))}
                        className="p-1.5 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-700 cursor-pointer"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="6.0"
                        step="0.1"
                        value={mascotScale}
                        onChange={(e) => updateMascotScale(parseFloat(e.target.value))}
                        className="flex-1 accent-indigo-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <button
                        onClick={() => updateMascotScale(Math.min(6.0, mascotScale + 0.2))}
                        className="p-1.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-700 cursor-pointer"
                      >
                        <ZoomIn size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Position X (Move Horizontal) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-700">
                      <span>Di chuyển Ngang (Trái / Phải)</span>
                      <span className="text-indigo-600 font-extrabold">{Math.round(mascotPos.x)}px</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="5"
                      value={mascotPos.x}
                      onChange={(e) => {
                        const newPos = { ...mascotPos, x: parseInt(e.target.value) };
                        setMascotPos(newPos);
                        localStorage.setItem('custom_character_pos', JSON.stringify(newPos));
                      }}
                      className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Position Y (Move Vertical) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-700">
                      <span>Di chuyển Dọc (Lên / Xuống)</span>
                      <span className="text-indigo-600 font-extrabold">{Math.round(mascotPos.y)}px</span>
                    </div>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      step="5"
                      value={mascotPos.y}
                      onChange={(e) => {
                        const newPos = { ...mascotPos, y: parseInt(e.target.value) };
                        setMascotPos(newPos);
                        localStorage.setItem('custom_character_pos', JSON.stringify(newPos));
                      }}
                      className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <p className="text-[10px] text-gray-500 font-medium italic">
                    💡 Mẹo: Bạn cũng có thể giữ chuột trực tiếp lên nhân vật ở màn hình Desktop để kéo thả vị trí mong muốn!
                  </p>
                </div>

                {/* 4. Stroke Glow Toggle */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-gray-800 block">Hiệu ứng Viền phát sáng (Blue Glow)</label>
                    <p className="text-[11px] text-gray-500">Tạo đường viền aura sáng xanh phong cách anime</p>
                  </div>
                  <button
                    onClick={() => setStrokeGlowEnabled(!strokeGlowEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      strokeGlowEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {strokeGlowEnabled ? 'Đang bật ✨' : 'Tắt'}
                  </button>
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    setCustomMascot('/images/anime_mascot_cutout.png');
                    setRawMascot('');
                    updateMascotScale(1.35);
                    setMascotPos({ x: 0, y: 0 });
                    localStorage.removeItem('custom_character_mascot');
                    localStorage.removeItem('raw_character_mascot');
                    localStorage.removeItem('custom_character_pos');
                    localStorage.removeItem('custom_character_scale');
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  title="Xóa ngay ảnh bị vỡ và khôi phục về nhân vật ban đầu"
                >
                  <Trash2 size={14} />
                  <span>🧹 Xóa bỏ ảnh vỡ & Đặt lại nhân vật mặc định</span>
                </button>
              </div>
            )}

            {/* TAB 2: STICKERS */}
            {settingTab === 'stickers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-800">Danh sách Sticker / Ảnh hình nền</h4>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Thêm sticker mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stickers.map((item, idx) => {
                    const isSelected = activeWallpaper === item.src;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveStickerIndex(idx);
                          changeWallpaper(item.src);
                        }}
                        className={`relative rounded-2xl overflow-hidden h-24 border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-indigo-600 shadow-lg scale-105 ring-2 ring-indigo-500/50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 p-2 flex items-end justify-between">
                          <span className="text-[11px] font-bold text-white truncate">{item.name}</span>
                          {isSelected && (
                            <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                              Đang dùng ✨
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}



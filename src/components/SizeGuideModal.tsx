import React, { useState } from 'react';
import { X, Ruler, Sparkles, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = 'Tops' }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [selectedGender, setSelectedGender] = useState<'men' | 'women'>('women');
  
  // Fit Calculator states
  const [userHeight, setUserHeight] = useState<number>(165);
  const [userWeight, setUserWeight] = useState<number>(60);
  const [calcResult, setCalcResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateFit = () => {
    // Intelligent sizing approximation
    const bmi = userWeight / ((userHeight / 100) * (userHeight / 100));
    if (bmi < 19) setCalcResult('XS (Extra Small) - Fitted Silhouette');
    else if (bmi < 22) setCalcResult('S (Small) - Regular Tailored Fit');
    else if (bmi < 25) setCalcResult('M (Medium) - Relaxed Comfortable Fit');
    else if (bmi < 28) setCalcResult('L (Large) - Contemporary Boxy Fit');
    else if (bmi < 31) setCalcResult('XL (Extra Large) - Generous Drape');
    else setCalcResult('XXL (Double Extra Large) - Custom Comfort');
  };

  const chartData = {
    women: [
      { size: 'XS', bustIn: '32 - 34', waistIn: '25 - 27', hipsIn: '35 - 37', lengthIn: '38', bustCm: '81 - 86', waistCm: '64 - 69', hipsCm: '89 - 94', lengthCm: '96' },
      { size: 'S', bustIn: '34 - 36', waistIn: '27 - 29', hipsIn: '37 - 39', lengthIn: '39', bustCm: '86 - 91', waistCm: '69 - 74', hipsCm: '94 - 99', lengthCm: '99' },
      { size: 'M', bustIn: '36 - 38', waistIn: '29 - 31', hipsIn: '39 - 41', lengthIn: '40', bustCm: '91 - 97', waistCm: '74 - 79', hipsCm: '99 - 104', lengthCm: '102' },
      { size: 'L', bustIn: '38 - 41', waistIn: '31 - 34', hipsIn: '41 - 44', lengthIn: '41', bustCm: '97 - 104', waistCm: '79 - 86', hipsCm: '104 - 112', lengthCm: '104' },
      { size: 'XL', bustIn: '41 - 44', waistIn: '34 - 37', hipsIn: '44 - 47', lengthIn: '42', bustCm: '104 - 112', waistCm: '86 - 94', hipsCm: '112 - 119', lengthCm: '107' },
      { size: 'XXL', bustIn: '44 - 47', waistIn: '37 - 41', hipsIn: '47 - 50', lengthIn: '43', bustCm: '112 - 119', waistCm: '94 - 104', hipsCm: '119 - 127', lengthCm: '109' },
    ],
    men: [
      { size: 'S (38)', bustIn: '38', waistIn: '30 - 32', hipsIn: '38', lengthIn: '40', bustCm: '96', waistCm: '76 - 81', hipsCm: '96', lengthCm: '102' },
      { size: 'M (40)', bustIn: '40', waistIn: '32 - 34', hipsIn: '40', lengthIn: '42', bustCm: '102', waistCm: '81 - 86', hipsCm: '102', lengthCm: '107' },
      { size: 'L (42)', bustIn: '42', waistIn: '34 - 36', hipsIn: '42', lengthIn: '44', bustCm: '107', waistCm: '86 - 91', hipsCm: '107', lengthCm: '112' },
      { size: 'XL (44)', bustIn: '44', waistIn: '36 - 38', hipsIn: '44', lengthIn: '45', bustCm: '112', waistCm: '91 - 97', hipsCm: '112', lengthCm: '114' },
      { size: 'XXL (46)', bustIn: '46', waistIn: '38 - 41', hipsIn: '46', lengthIn: '46', bustCm: '117', waistCm: '97 - 104', hipsCm: '117', lengthCm: '117' },
    ]
  };

  const currentList = selectedGender === 'women' ? chartData.women : chartData.men;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-950 text-white rounded-lg">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-neutral-900">
                Atelier Tailored Size & Measurement Guide
              </h3>
              <p className="text-xs text-neutral-500">
                Accurate fitting guidelines for garments, Panjabi, dresses & bespoke tailoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-800">
          
          {/* Controls: Gender & Metric Switch */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedGender('women')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === 'women'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Women's Collection
              </button>
              <button
                onClick={() => setSelectedGender('men')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === 'men'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Men's / Panjabi Collection
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  unit === 'inches' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-600'
                }`}
              >
                Inches (in)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  unit === 'cm' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-600'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-white font-serif uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">{selectedGender === 'men' ? 'Chest / Bust' : 'Bust'}</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">{selectedGender === 'men' ? 'Hip / Seat' : 'Hips'}</th>
                  <th className="py-3 px-4">Garment Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {currentList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-950 font-sans">{row.size}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? row.bustIn : row.bustCm}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? row.waistIn : row.waistCm}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? row.hipsIn : row.hipsCm}</td>
                    <td className="py-3 px-4">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI / Smart Fit Calculator */}
          <div className="p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl shadow-md">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Smart Fit & Body Size Recommender</span>
            </div>
            <p className="text-xs text-neutral-300 mb-4">
              Enter your height and weight to receive tailored sizing for modern draping.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Height (cm): <span className="text-white font-mono font-bold">{userHeight} cm</span>
                </label>
                <input
                  type="range"
                  min="140"
                  max="200"
                  value={userHeight}
                  onChange={(e) => setUserHeight(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Weight (kg): <span className="text-white font-mono font-bold">{userWeight} kg</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={userWeight}
                  onChange={(e) => setUserWeight(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={calculateFit}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow"
                >
                  Calculate My Size
                </button>
              </div>
            </div>

            {calcResult && (
              <div className="p-3 bg-white/10 border border-white/15 rounded-xl flex items-center gap-3 animate-fadeIn">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-neutral-300 uppercase tracking-wider block">Recommended Atelier Fit:</span>
                  <span className="text-sm font-bold text-amber-300">{calcResult}</span>
                </div>
              </div>
            )}
          </div>

          {/* How to Measure Guidelines */}
          <div className="border-t border-neutral-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-600">
            <div>
              <h4 className="font-bold text-neutral-900 mb-1">1. Chest / Bust</h4>
              <p className="text-neutral-500 leading-relaxed">
                Measure around the fullest part of your chest, keeping the tape horizontal under the arms.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-1">2. Natural Waist</h4>
              <p className="text-neutral-500 leading-relaxed">
                Measure around your natural waistline, where trousers or sarees naturally sit comfortably.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-1">3. Garment Length</h4>
              <p className="text-neutral-500 leading-relaxed">
                Measured from the highest point of the shoulder seam straight down to the hem.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            Got It, Return to Garment
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Sparkles, Sliders, Pickaxe, RefreshCw, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
import PredictionCard from "../components/common/PredictionCard";
import LoadingState from "../components/common/LoadingState";
import DataTable from "../components/common/DataTable";
import { predictReserve, getMiningZones } from "../services/api";
import { formatGrade, formatTonnes } from "../utils/formatters";

export const ReservesPage = () => {
  const [zones, setZones] = useState([]);
  const [formData, setFormData] = useState({
    region: "Dongri Buzurg Sector 1",
    oreGrade: 43.2,
    depth: 145,
    rockDensity: 3.85,
    rockType: "sedimentary",
    geologicalScore: 88,
    historicalYield: 81,
    spectralIndex: 0.89,
  });

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const zList = await getMiningZones();
      setZones(zList);
      // Run initial analysis automatically with default preset
      handleRunAnalysis({
        region: "Dongri Buzurg Sector 1",
        oreGrade: 43.2,
        depth: 145,
        rockDensity: 3.85,
        rockType: "sedimentary",
        geologicalScore: 88,
        historicalYield: 81,
        spectralIndex: 0.89,
      });
    };
    loadInitialData();
  }, []);

  const handleRunAnalysis = async (customForm = null) => {
    const dataToSubmit = customForm || formData;
    setLoading(true);
    try {
      const result = await predictReserve({
        ...dataToSubmit,
        ore_grade: dataToSubmit.oreGrade,
        density: dataToSubmit.rockDensity,
        rock_type: dataToSubmit.rockType || "sedimentary",
        mining_zone_id: dataToSubmit.mining_zone_id ?? null,
      });
      setPredictionResult(result);
    } catch (err) {
      console.error("Reserve prediction error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleZonePresetSelect = (zone) => {
    const updated = {
      region: zone.name,
      oreGrade: zone.oreGradePercent,
      depth: zone.depthMeters,
      rockDensity: zone.rockDensity,
      rockType: "sedimentary",
      geologicalScore: zone.geologicalScore,
      historicalYield: 80,
      spectralIndex: zone.spectralRatioIndex,
    };
    setFormData(updated);
    handleRunAnalysis(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-white border border-[#D8E6F3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1B2942] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#3498DB]" />
            AI Ore Reserve Potential & Tonnage Estimator
          </h2>
          <p className="text-xs text-[#606F81] mt-1">
            Input geological borehole assays, rock density, depth metrics, and satellite spectral indices to generate instant ML reserve predictions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#27AE60] bg-[#E8F8F0] border border-[#27AE60]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4" />
            XGBoost ML Engine Active
          </span>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) vs AI Prediction Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E6F3] rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#EBF3FB] pb-3">
            <h3 className="text-xs font-bold text-[#1B2942] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#3498DB]" />
              Geological & Assaying Inputs
            </h3>
            <button
              onClick={() => {
                setFormData({
                  region: "Custom Exploratory Pit",
                  oreGrade: 38.0,
                  depth: 160,
                  rockDensity: 3.6,
                  rockType: "sedimentary",
                  geologicalScore: 70,
                  historicalYield: 75,
                  spectralIndex: 0.75,
                });
              }}
              className="text-xs text-[#606F81] hover:text-[#1B2942] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#606F81] block mb-2">
              Load Preset Mining Zone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {zones.slice(0, 5).map((z) => (
                <button
                  key={z.id}
                  onClick={() => handleZonePresetSelect(z)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    formData.region === z.name
                      ? "bg-[#3498DB] text-white border-[#3498DB] font-bold shadow-xs"
                      : "bg-[#F8FBFE] text-[#1B2942] border-[#D8E6F3] hover:bg-slate-100"
                  }`}
                >
                  {z.name.split(" ")[0]} ({z.id})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Mining Region Name */}
            <div>
              <label className="font-semibold text-[#1B2942] block mb-1">Mining Region / Deposit Name</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-[#F8FBFE] border border-[#D8E6F3] rounded-lg px-3 py-2 text-[#1B2942] focus:outline-none focus:border-[#3498DB] transition-all font-medium"
              />
            </div>

            {/* Ore Grade % Slider */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#1B2942]">Ore Grade (% Mn)</span>
                <span className="text-[#27AE60] font-bold">{formData.oreGrade}% Mn</span>
              </div>
              <input
                type="range"
                min="20"
                max="55"
                step="0.1"
                value={formData.oreGrade}
                onChange={(e) => setFormData({ ...formData, oreGrade: parseFloat(e.target.value) })}
                className="w-full accent-[#3498DB] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#606F81] mt-0.5">
                <span>20% (Low Grade)</span>
                <span>40% (Ferro Grade)</span>
                <span>55% (Battery Grade)</span>
              </div>
            </div>

            {/* Depth (meters) Slider */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#1B2942]">Exploratory Depth (meters)</span>
                <span className="text-[#3498DB] font-bold">{formData.depth} m</span>
              </div>
              <input
                type="range"
                min="30"
                max="350"
                step="5"
                value={formData.depth}
                onChange={(e) => setFormData({ ...formData, depth: parseInt(e.target.value) })}
                className="w-full accent-[#3498DB] cursor-pointer"
              />
            </div>

            {/* Rock Density (g/cm³) */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#1B2942]">Rock Density (g/cm³)</span>
                <span className="text-[#1B2942] font-bold">{formData.rockDensity} g/cm³</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="4.5"
                step="0.05"
                value={formData.rockDensity}
                onChange={(e) => setFormData({ ...formData, rockDensity: parseFloat(e.target.value) })}
                className="w-full accent-[#3498DB] cursor-pointer"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1B2942] block mb-1">Rock type (ML input)</label>
              <select
                value={formData.rockType}
                onChange={(e) => setFormData({ ...formData, rockType: e.target.value })}
                className="w-full bg-[#F8FBFE] border border-[#D8E6F3] rounded-lg px-3 py-2 text-[#1B2942] focus:outline-none focus:border-[#3498DB] font-medium"
              >
                <option value="sedimentary">sedimentary</option>
                <option value="metamorphic">metamorphic</option>
                <option value="igneous">igneous</option>
                <option value="laterite">laterite</option>
              </select>
            </div>

            {/* Geological Anomaly Score (1-100) */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#1B2942]">Geological Structure Score</span>
                <span className="text-[#27AE60] font-bold">{formData.geologicalScore}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={formData.geologicalScore}
                onChange={(e) => setFormData({ ...formData, geologicalScore: parseInt(e.target.value) })}
                className="w-full accent-[#3498DB] cursor-pointer"
              />
            </div>

            {/* Satellite Spectral Index (0-1) */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-[#1B2942]">Satellite Spectral Index (ASTER/Sentinel)</span>
                <span className="text-[#3498DB] font-bold">{formData.spectralIndex}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.01"
                value={formData.spectralIndex}
                onChange={(e) => setFormData({ ...formData, spectralIndex: parseFloat(e.target.value) })}
                className="w-full accent-[#3498DB] cursor-pointer"
              />
            </div>
          </div>

          {/* Run AI Analysis Button */}
          <button
            onClick={() => handleRunAnalysis()}
            disabled={loading}
            className="w-full py-3 px-4 bg-[#3498DB] hover:bg-[#2980B9] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Pickaxe className="w-4 h-4 animate-spin" /> Executing Geospatial ML Inference...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Run AI Reserve Analysis
              </span>
            )}
          </button>
        </div>

        {/* Prediction Results Display (7 Cols) */}
        <div className="lg:col-span-7">
          {loading ? (
            <LoadingState
              message="Evaluating Reserve Potential & Quantity..."
              subtext="Executing XGBoost + Geospatial Inversion ML Models against borehole parameters"
            />
          ) : (
            predictionResult && <PredictionCard prediction={predictionResult} />
          )}
        </div>
      </div>

      {/* Zone Comparison Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1B2942] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3498DB]" />
          Ore Reserve Matrix Comparison
        </h3>

        <DataTable
          columns={[
            { header: "Zone ID", key: "id", sortable: true, render: (r) => <span className="font-mono font-bold text-[#3498DB]">{r.id}</span> },
            { header: "Deposit Name", key: "name", sortable: true, render: (r) => <span className="font-semibold text-[#1B2942]">{r.name}</span> },
            { header: "Reserve Potential", key: "reservePotential", sortable: true, render: (r) => <span className="font-bold text-[#27AE60]">{r.potentialScore}% ({r.reservePotential})</span> },
            { header: "Est. Reserve", key: "estimatedReserveMT", sortable: true, render: (r) => <span className="font-bold text-[#1B2942]">{r.estimatedReserveMT} MT</span> },
            { header: "Ore Grade", key: "oreGradePercent", sortable: true, render: (r) => <span className="font-semibold text-[#27AE60]">{formatGrade(r.oreGradePercent)}</span> },
            { header: "Depth (m)", key: "depthMeters", sortable: true, render: (r) => <span className="text-[#606F81]">{r.depthMeters} m</span> },
            { header: "Rock Density", key: "rockDensity", sortable: true, render: (r) => <span className="text-[#606F81]">{r.rockDensity} g/cm³</span> },
            {
              header: "Action",
              key: "action",
              render: (r) => (
                <button
                  onClick={() => handleZonePresetSelect(r)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#3498DB] font-semibold text-[11px] rounded border border-[#D8E6F3] transition-colors cursor-pointer shadow-2xs"
                >
                  Analyze Zone
                </button>
              ),
            },
          ]}
          data={zones}
          pageSize={5}
          searchPlaceholder="Search reserve deposits..."
        />
      </div>
    </div>
  );
};

export default ReservesPage;

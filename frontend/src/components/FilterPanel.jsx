import React, { useState } from "react";

const FilterPanel = ({ skills, onApply, onClose }) => {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [maxDistance, setMaxDistance] = useState(10000);

  const handleApply = () => {
    onApply({ skill: selectedSkill, maxDistance });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end">
      <div className="w-72 bg-background-light dark:bg-background-dark p-6 shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
          <button
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Skill
          </label>
          <select
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {skills.map((skill) => (
              <option key={skill.name} value={skill.name}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Max Distance (km)
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={maxDistance / 1000}
            onChange={(e) => setMaxDistance(e.target.value * 1000)}
            className="w-full"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {maxDistance / 1000} km
          </p>
        </div>

        <button
          className="mt-auto rounded-full bg-primary text-white py-2 font-semibold hover:bg-primary/90 transition"
          onClick={handleApply}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;

// src/components/SkillCategoryList.jsx
import React from "react";

const SkillCategoryList = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <section className="py-4">
      <h2 className="px-4 text-xl font-bold text-slate-900 dark:text-white">
        Skill Categories
      </h2>
      <div className="mt-4 flex gap-4 overflow-x-auto px-4 scrollbar-none">
        {categories.map((skill) => (
          <div
            key={skill.name}
            className={`flex flex-col items-center gap-2 text-center cursor-pointer transition-transform ${
              selectedCategory === skill.name ? "scale-105" : ""
            }`}
            onClick={() =>
              onSelectCategory(
                selectedCategory === skill.name ? null : skill.name
              )
            }
          >
            <div
              className={`h-20 w-20 rounded-full bg-cover bg-center border-2 ${
                selectedCategory === skill.name
                  ? "border-primary"
                  : "border-transparent"
              }`}
              style={{ backgroundImage: `url(${skill.image})` }}
            ></div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {skill.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillCategoryList;

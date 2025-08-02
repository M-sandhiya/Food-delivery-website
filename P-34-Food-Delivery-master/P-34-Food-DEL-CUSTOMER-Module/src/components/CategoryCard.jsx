import React from 'react';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="min-w-[100px] flex-shrink-0 cursor-pointer flex flex-col items-center group"
    >
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-200 shadow-md mb-2 bg-white group-hover:shadow-lg transition-shadow duration-200">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900 text-center truncate mt-1">
        {category.name}
      </h3>
    </div>
  );
};

export default CategoryCard;
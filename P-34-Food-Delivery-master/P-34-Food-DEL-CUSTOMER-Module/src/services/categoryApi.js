// Mock category data
export const mockCategories = [
  {
    id: 1,
    name: 'Biryani',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1'
  },
  {
    id: 2,
    name: 'Pizza',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1'
  },
  {
    id: 3,
    name: 'Burgers',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1'
  },
  {
    id: 4,
    name: 'Chinese',
    image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1'
  },
  {
    id: 5,
    name: 'Desserts',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1'
  },
  {
    id: 6,
    name: 'South Indian',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&dpr=1'
  }
];

export const getCategories = async () => {
  // Simulate async call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCategories);
    }, 100); // 100ms delay to simulate network
  });
};

export const getCategoryById = async (categoryId) => {
  return mockCategories.find(cat => cat.id == categoryId); // Use loose equality for robust matching
}; 
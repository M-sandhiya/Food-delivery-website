import React, { useEffect, useState } from 'react';
import '../../styles/reviews.css';

const mockReviews = [
  {
    customerName: 'Narayan Kumar',
    dish: 'Paneer Butter Masala',
    rating: 4.5,
    comment: 'Delicious and creamy!',
    date: '2025-06-20',
  },
  {
    customerName: 'Ayesha Khan',
    dish: 'Veg Biryani',
    rating: 4.2,
    comment: 'Great taste but could be spicier.',
    date: '2025-06-21',
  },
  {
    customerName: 'Karan Mehta',
    dish: 'Chicken Tikka',
    rating: 5.0,
    comment: 'Absolutely perfect!',
    date: '2025-06-23',
  },
];

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Simulate API call
    setReviews(mockReviews);
  }, []);

  return (
    <div className="reviews-container">
      <h2>🌟 Customer Ratings & Reviews</h2>

      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div className="review-card" key={index}>
              <div className="review-header">
                <h4>{review.customerName}</h4>
                <span className="rating">⭐ {review.rating}</span>
              </div>
              <p><strong>Dish:</strong> {review.dish}</p>
              <p><strong>Comment:</strong> {review.comment}</p>
              <p className="review-date">{new Date(review.date).toDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;

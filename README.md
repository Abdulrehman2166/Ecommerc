# 🛍️ LUXE — Global Branded Product Comparison Platform (GBPC)

A modern, luxury dark-themed e-commerce platform for discovering and comparing premium branded products from global stores.

## 🌟 Features

### User Features
- 🔍 **Product Search** - Search across global stores
- ⭐ **Product Ratings** - See user reviews and ratings
- 💰 **Price Comparison** - Compare prices across countries
- 🏪 **Multi-Store Support** - Pakistan, India, USA, UAE
- 📊 **Smart Ranking** - Products ranked by quality, reputation, and reviews
- 💚 **Wishlist System** - Save favorite products
- 👤 **User Accounts** - JWT authentication with accounts

### Admin Features
- ➕ **Product Management** - Add, edit, delete products
- 📈 **Analytics Dashboard** - View sales and user metrics
- 👥 **User Management** - Manage user accounts
- ⭐ **Review Management** - Moderate customer reviews
- 🏢 **Brand Management** - Manage brand information

## 🎨 Design System

### Colors
- **Primary**: Purple (#8b5cf6)
- **Accent Gold**: #fbbf24
- **Dark Background**: #0a0a0f
- **Text Primary**: #f5f5f7

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Components
- Modern gradient buttons with hover effects
- Glass-morphism cards
- Smooth animations and transitions
- Fully responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### MongoDB Setup
```bash
# Start local MongoDB
mongod

# Or use MongoDB Atlas
# Update MONGO_URI in backend/.env
```

### Import Sample Data
1. Visit http://localhost:3000
2. Click "📥 Import Sample Data" button
3. Products from DummyJSON will be imported

## 📁 Project Structure

```
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   └── ProductDetails.jsx
│   │   ├── components/
│   │   │   └── ProductCard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Brand.js
│   │   └── Review.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── products.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   │   └── productFetcher.js
│   ├── config/
│   │   └── db.js
│   ├── .env
│   ├── server.js
│   └── package.json
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `GET /api/products/compare` - Compare products
- `GET /api/products/brands` - List all brands
- `GET /api/products/import/dummy` - Import DummyJSON data

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## 🎯 Product Scoring Algorithm

```
productScore = (qualityRating × 0.5) + (brandReputation × 0.3) + (userReviews × 0.2)
```

Products are ranked by this score to show best value options.

## 🌐 Supported Stores (Future)

- Pakistan: Daraz
- India: Flipkart, Amazon India
- USA: Amazon US, Walmart, eBay
- UAE: Noon, Amazon UAE

Currently using DummyJSON for sample data.

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Google Fonts (Playfair Display + Inter)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

### Database
- MongoDB (local or Atlas)

## 📦 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gbpc
JWT_SECRET=your_secret_key
RAPIDAPI_KEY=your_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📝 License

MIT License - feel free to use this project

## 🤝 Contributing

Contributions are welcome! Please submit PRs with improvements.

## 📞 Support

For issues and questions, open a GitHub issue or contact the development team.

---

**Made with ❤️ for e-commerce lovers worldwide**

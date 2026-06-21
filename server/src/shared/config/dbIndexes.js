const logger = require('../utils/logger');

const createIndexes = async () => {
  try {
    const User = require('../../modules/auth/auth.model');
    const Event = require('../../modules/events/event.model');
    const Venue = require('../../modules/venue/venue.model');
    const Category = require('../../modules/category/category.model');

    // User Indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ createdAt: -1 });

    // Event Indexes
    await Event.collection.createIndex({ slug: 1 }, { unique: true });
    await Event.collection.createIndex({ organizer: 1, status: 1 });
    await Event.collection.createIndex({ category: 1, status: 1 });
    await Event.collection.createIndex({ startDate: 1, status: 1 });
    await Event.collection.createIndex({ isFeatured: 1, status: 1 });
    await Event.collection.createIndex(
      { title: 'text', description: 'text', tags: 'text' },
      { weights: { title: 10, tags: 5, description: 1 } }
    );

    // Venue Indexes
    await Venue.collection.createIndex({ location: '2dsphere' });
    await Venue.collection.createIndex({ 'address.city': 1 });

    // Category Indexes
    await Category.collection.createIndex({ slug: 1 }, { unique: true });
    await Category.collection.createIndex({ isActive: 1 });

    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.error(`❌ Index creation error: ${error.message}`);
  }
};

module.exports = createIndexes;
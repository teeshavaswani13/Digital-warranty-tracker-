import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, calculateExpiry, computeWarrantyStatus, Product } from './db';
import { authMiddleware, generateToken, AuthRequest } from './auth';

export const apiRouter = Router();

// ==================== AUTHENTICATION ====================

// POST /api/auth/login
apiRouter.post('/auth/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// POST /api/auth/register (or /api/auth/signup)
const handleRegister = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Please provide your full name.' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = await db.findUserByEmail(email.trim());
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      email: email.trim(),
      passwordHash,
      name: name.trim(),
    });

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name,
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

apiRouter.post('/auth/register', handleRegister);
apiRouter.post('/auth/signup', handleRegister);

// GET /api/auth/me
apiRouter.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await db.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

// ==================== DASHBOARD STATS ====================

// GET /api/dashboard/stats
apiRouter.get('/dashboard/stats', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const products = await db.getProductsByUser(userId);

    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    const productsWithComputed = products.map((p) => {
      const { status, daysRemaining } = computeWarrantyStatus(p.warrantyExpiryDate);
      if (status === 'active') activeCount++;
      else if (status === 'expiring_soon') expiringSoonCount++;
      else if (status === 'expired') expiredCount++;

      return {
        ...p,
        warrantyStatus: status,
        daysRemaining,
      };
    });

    // Upcoming warranty expiry alerts (expiring within 30 days and not expired)
    const upcomingAlerts = productsWithComputed
      .filter((p) => p.warrantyStatus === 'expiring_soon' && p.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .map((p) => ({
        id: p._id,
        productName: p.productName,
        brandName: p.brandName,
        daysRemaining: p.daysRemaining,
        warrantyExpiryDate: p.warrantyExpiryDate,
        isToday: p.daysRemaining === 0,
        urgency: p.daysRemaining === 0 ? 'critical' : p.daysRemaining <= 7 ? 'high' : 'medium',
        message:
          p.daysRemaining === 0
            ? `Your ${p.brandName} ${p.productName} warranty expires today!`
            : p.daysRemaining === 1
            ? `Your ${p.brandName} ${p.productName} warranty expires tomorrow!`
            : `Your ${p.brandName} ${p.productName} warranty expires in ${p.daysRemaining} days.`,
      }));

    // Recent products (latest 4)
    const recentProducts = productsWithComputed.slice(0, 4);

    res.json({
      totalProducts: products.length,
      activeWarranties: activeCount,
      expiringSoon: expiringSoonCount,
      expiredWarranties: expiredCount,
      upcomingAlerts,
      recentProducts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to compute dashboard metrics.' });
  }
});

// ==================== PRODUCTS CRUD ====================

// GET /api/products
apiRouter.get('/products', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { search, category, status, sort } = req.query;

    let products = await db.getProductsByUser(userId);

    // Compute status for all
    let computedList = products.map((p) => {
      const { status, daysRemaining } = computeWarrantyStatus(p.warrantyExpiryDate);
      return {
        ...p,
        warrantyStatus: status,
        daysRemaining,
      };
    });

    // Search filter (product name or brand)
    if (typeof search === 'string' && search.trim()) {
      const query = search.toLowerCase().trim();
      computedList = computedList.filter(
        (p) =>
          p.productName.toLowerCase().includes(query) ||
          p.brandName.toLowerCase().includes(query) ||
          (p.serialNumber && p.serialNumber.toLowerCase().includes(query)) ||
          (p.storeName && p.storeName.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (typeof category === 'string' && category && category !== 'All') {
      computedList = computedList.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Status filter
    if (typeof status === 'string' && status && status !== 'All') {
      computedList = computedList.filter((p) => p.warrantyStatus === status);
    }

    // Sort
    if (sort === 'expiry_asc') {
      computedList.sort(
        (a, b) =>
          new Date(a.warrantyExpiryDate).getTime() - new Date(b.warrantyExpiryDate).getTime()
      );
    } else if (sort === 'expiry_desc') {
      computedList.sort(
        (a, b) =>
          new Date(b.warrantyExpiryDate).getTime() - new Date(a.warrantyExpiryDate).getTime()
      );
    } else if (sort === 'price_desc') {
      computedList.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === 'name_asc') {
      computedList.sort((a, b) => a.productName.localeCompare(b.productName));
    } else {
      // default: newest added first
      computedList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json(computedList);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:id
apiRouter.get('/products/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const product = await db.getProductById(id, userId);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const { status, daysRemaining } = computeWarrantyStatus(product.warrantyExpiryDate);
    res.json({
      ...product,
      warrantyStatus: status,
      daysRemaining,
    });
  } catch (error) {
    console.error('Fetch single product error:', error);
    res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

// POST /api/products
apiRouter.post('/products', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      productName,
      brandName,
      category,
      purchaseDate,
      warrantyDurationMonths,
      price,
      serialNumber,
      storeName,
      notes,
    } = req.body;

    // Validation
    if (!productName || !brandName || !category || !purchaseDate || !warrantyDurationMonths) {
      res.status(400).json({
        error:
          'Please fill all required fields: Product Name, Brand Name, Category, Purchase Date, and Warranty Duration.',
      });
      return;
    }

    const durationNum = parseInt(String(warrantyDurationMonths), 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      res.status(400).json({ error: 'Warranty duration must be a positive number of months.' });
      return;
    }

    // Calculate expiry date automatically
    const calculatedExpiry = calculateExpiry(purchaseDate, durationNum);

    const created = await db.createProduct(userId, {
      productName: productName.trim(),
      brandName: brandName.trim(),
      category: category.trim(),
      purchaseDate,
      warrantyDurationMonths: durationNum,
      warrantyExpiryDate: calculatedExpiry,
      price: price ? parseFloat(String(price)) : undefined,
      serialNumber: serialNumber ? serialNumber.trim() : undefined,
      storeName: storeName ? storeName.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
    });

    const { status, daysRemaining } = computeWarrantyStatus(created.warrantyExpiryDate);

    res.status(201).json({
      ...created,
      warrantyStatus: status,
      daysRemaining,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product warranty record.' });
  }
});

// PUT /api/products/:id
apiRouter.put('/products/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const {
      productName,
      brandName,
      category,
      purchaseDate,
      warrantyDurationMonths,
      price,
      serialNumber,
      storeName,
      notes,
    } = req.body;

    const existing = await db.getProductById(id, userId);
    if (!existing) {
      res.status(404).json({ error: 'Product not found or access denied.' });
      return;
    }

    const durationNum =
      warrantyDurationMonths !== undefined
        ? parseInt(String(warrantyDurationMonths), 10)
        : existing.warrantyDurationMonths;

    const newPurchaseDate = purchaseDate || existing.purchaseDate;
    const calculatedExpiry = calculateExpiry(newPurchaseDate, durationNum);

    const updated = await db.updateProduct(id, userId, {
      productName: productName !== undefined ? productName.trim() : existing.productName,
      brandName: brandName !== undefined ? brandName.trim() : existing.brandName,
      category: category !== undefined ? category.trim() : existing.category,
      purchaseDate: newPurchaseDate,
      warrantyDurationMonths: durationNum,
      warrantyExpiryDate: calculatedExpiry,
      price: price !== undefined && price !== '' ? parseFloat(String(price)) : undefined,
      serialNumber: serialNumber !== undefined ? serialNumber.trim() : existing.serialNumber,
      storeName: storeName !== undefined ? storeName.trim() : existing.storeName,
      notes: notes !== undefined ? notes.trim() : existing.notes,
    });

    if (!updated) {
      res.status(404).json({ error: 'Failed to update product.' });
      return;
    }

    const { status, daysRemaining } = computeWarrantyStatus(updated.warrantyExpiryDate);

    res.json({
      ...updated,
      warrantyStatus: status,
      daysRemaining,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product warranty record.' });
  }
});

// DELETE /api/products/:id
apiRouter.delete('/products/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await db.getProductById(id, userId);
    if (!existing) {
      res.status(404).json({ error: 'Product not found or access denied.' });
      return;
    }

    const success = await db.deleteProduct(id, userId);
    if (!success) {
      res.status(500).json({ error: 'Failed to delete product record.' });
      return;
    }

    res.json({ success: true, message: 'Product warranty record deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

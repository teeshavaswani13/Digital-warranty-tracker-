import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { MongoClient, Db } from 'mongodb';

export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  userId: string;
  productName: string;
  brandName: string;
  category: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyDurationMonths: number;
  warrantyExpiryDate: string; // YYYY-MM-DD
  price?: number;
  serialNumber?: string;
  storeName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function calculateExpiry(purchaseDate: string, durationMonths: number): string {
  const [yearStr, monthStr, dayStr] = purchaseDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + durationMonths);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function computeWarrantyStatus(expiryDate: string): {
  status: 'active' | 'expiring_soon' | 'expired';
  daysRemaining: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [yearStr, monthStr, dayStr] = expiryDate.split('-');
  const expiry = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining };
  } else if (daysRemaining <= 30) {
    return { status: 'expiring_soon', daysRemaining };
  } else {
    return { status: 'active', daysRemaining };
  }
}

// Local Document DB Fallback implementation
interface DatabaseSchema {
  users: User[];
  products: Product[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'warranty_db.json');

class DocumentStore {
  private data: DatabaseSchema = { users: [], products: [] };
  private mongoDb: Db | null = null;
  private isConnectedToMongo = false;

  constructor() {
    this.initLocalStore();
  }

  private initLocalStore() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = { users: [], products: [] };
      }
    } else {
      this.data = { users: [], products: [] };
      this.persistLocalStore();
    }
  }

  private persistLocalStore() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to local database file:', err);
    }
  }

  public async init() {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      try {
        const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
        await client.connect();
        this.mongoDb = client.db();
        this.isConnectedToMongo = true;
        console.log('Connected to MongoDB database successfully.');
      } catch {
        console.log('MongoDB server not reachable at MONGODB_URI. Operating with local persistent JSON document database.');
        this.isConnectedToMongo = false;
      }
    } else {
      console.log('Using local persistent document database (./data/warranty_db.json).');
    }

    await this.seedInitialUserAndProducts();
  }

  public async seedInitialUserAndProducts() {
    const defaultEmail = process.env.INITIAL_USER_EMAIL || 'demo@warrantytracker.com';
    const defaultPassword = process.env.INITIAL_USER_PASSWORD || 'password123';

    let user = await this.findUserByEmail(defaultEmail);
    if (!user) {
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      user = {
        _id: 'user_demo_01',
        email: defaultEmail,
        passwordHash,
        name: 'Alex Morgan',
        createdAt: new Date().toISOString(),
      };

      if (this.isConnectedToMongo && this.mongoDb) {
        await this.mongoDb.collection('users').insertOne(user as any);
      } else {
        this.data.users.push(user);
        this.persistLocalStore();
      }
      console.log(`Initial user seeded: ${defaultEmail}`);
    }

    // Seed realistic products if the user has 0 products
    const existingProducts = await this.getProductsByUser(user._id);
    if (existingProducts.length === 0) {
      const now = new Date();
      // Date helper: YYYY-MM-DD
      const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      // 1. MacBook Pro (Purchased 4 months ago, 12 month warranty -> Active)
      const p1Date = new Date(now);
      p1Date.setMonth(p1Date.getMonth() - 4);
      const p1Expiry = calculateExpiry(formatDate(p1Date), 12);

      // 2. Sony WH-1000XM5 (Purchased 11 months and 20 days ago, 12 month warranty -> Expiring in ~10 days)
      const p2Date = new Date(now);
      p2Date.setMonth(p2Date.getMonth() - 12);
      p2Date.setDate(p2Date.getDate() + 10); // expires 10 days from today
      const p2Expiry = calculateExpiry(formatDate(p2Date), 12);

      // 3. Samsung OLED 4K Smart TV (Purchased 2 years ago, 12 month warranty -> Expired)
      const p3Date = new Date(now);
      p3Date.setFullYear(p3Date.getFullYear() - 2);
      const p3Expiry = calculateExpiry(formatDate(p3Date), 12);

      // 4. Dyson V12 Cordless Vacuum (Purchased 2 months ago, 24 month warranty -> Active)
      const p4Date = new Date(now);
      p4Date.setMonth(p4Date.getMonth() - 2);
      const p4Expiry = calculateExpiry(formatDate(p4Date), 24);

      // 5. Apple iPad Air M2 (Purchased 11 months ago, 12 month warranty -> Expiring soon in ~22 days)
      const p5Date = new Date(now);
      p5Date.setMonth(p5Date.getMonth() - 12);
      p5Date.setDate(p5Date.getDate() + 22);
      const p5Expiry = calculateExpiry(formatDate(p5Date), 12);

      const sampleProducts: Product[] = [
        {
          _id: 'prod_' + crypto.randomUUID().slice(0, 8),
          userId: user._id,
          productName: 'MacBook Pro 16" M3 Pro',
          brandName: 'Apple',
          category: 'Computing',
          purchaseDate: formatDate(p1Date),
          warrantyDurationMonths: 12,
          warrantyExpiryDate: p1Expiry,
          price: 249900,
          serialNumber: 'C02GK915MD6R',
          storeName: 'Apple Store Mumbai',
          notes: 'Standard 1-year limited warranty. Keep receipt for AppleCare inquiries.',
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        },
        {
          _id: 'prod_' + crypto.randomUUID().slice(0, 8),
          userId: user._id,
          productName: 'WH-1000XM5 Wireless Headphones',
          brandName: 'Sony',
          category: 'Audio',
          purchaseDate: formatDate(p2Date),
          warrantyDurationMonths: 12,
          warrantyExpiryDate: p2Expiry,
          price: 29990,
          serialNumber: 'S01-987214-H',
          storeName: 'Croma Electronics',
          notes: 'Left earcup hinge inspected. Covered for manufacturer hardware defects.',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
        {
          _id: 'prod_' + crypto.randomUUID().slice(0, 8),
          userId: user._id,
          productName: '65" OLED 4K Smart TV S90C',
          brandName: 'Samsung',
          category: 'Home Appliances',
          purchaseDate: formatDate(p3Date),
          warrantyDurationMonths: 12,
          warrantyExpiryDate: p3Expiry,
          price: 149990,
          serialNumber: 'ZA48729501B',
          storeName: 'Reliance Digital',
          notes: 'Expired warranty. Consider third-party home appliance protection plan.',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          _id: 'prod_' + crypto.randomUUID().slice(0, 8),
          userId: user._id,
          productName: 'V12 Detect Slim Cordless Vacuum',
          brandName: 'Dyson',
          category: 'Home Appliances',
          purchaseDate: formatDate(p4Date),
          warrantyDurationMonths: 24,
          warrantyExpiryDate: p4Expiry,
          price: 54900,
          serialNumber: 'DY-88219-IN',
          storeName: 'Dyson Direct India',
          notes: 'Includes 2-year Dyson genuine parts and motor warranty guarantee.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          _id: 'prod_' + crypto.randomUUID().slice(0, 8),
          userId: user._id,
          productName: 'iPad Air 11" M2 256GB',
          brandName: 'Apple',
          category: 'Mobile & Gadgets',
          purchaseDate: formatDate(p5Date),
          warrantyDurationMonths: 12,
          warrantyExpiryDate: p5Expiry,
          price: 59900,
          serialNumber: 'DMPZK829A01',
          storeName: 'Amazon India',
          notes: 'Expiring soon. Inspect battery health before warranty cutoff.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const prod of sampleProducts) {
        if (this.isConnectedToMongo && this.mongoDb) {
          await this.mongoDb.collection('products').insertOne(prod as any);
        } else {
          this.data.products.push(prod);
        }
      }
      if (!this.isConnectedToMongo) {
        this.persistLocalStore();
      }
    }
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isConnectedToMongo && this.mongoDb) {
      const u = await this.mongoDb.collection('users').findOne({ email: cleanEmail });
      return u as unknown as User | null;
    }
    return this.data.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  public async createUser(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    const newUser: User = {
      _id: 'user_' + crypto.randomUUID().slice(0, 8),
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      createdAt: new Date().toISOString(),
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('users').insertOne(newUser as any);
    } else {
      this.data.users.push(newUser);
      this.persistLocalStore();
    }
    return newUser;
  }

  public async findUserById(id: string): Promise<User | null> {
    if (this.isConnectedToMongo && this.mongoDb) {
      const u = await this.mongoDb.collection('users').findOne({ _id: id as any });
      return u as unknown as User | null;
    }
    return this.data.users.find((u) => u._id === id) || null;
  }

  public async getProductsByUser(userId: string): Promise<Product[]> {
    if (this.isConnectedToMongo && this.mongoDb) {
      const list = await this.mongoDb
        .collection('products')
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      return list as unknown as Product[];
    }
    return this.data.products
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getProductById(id: string, userId: string): Promise<Product | null> {
    if (this.isConnectedToMongo && this.mongoDb) {
      const prod = await this.mongoDb.collection('products').findOne({ _id: id as any, userId });
      return prod as unknown as Product | null;
    }
    return this.data.products.find((p) => p._id === id && p.userId === userId) || null;
  }

  public async createProduct(
    userId: string,
    data: Omit<Product, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    const newProduct: Product = {
      _id: 'prod_' + crypto.randomUUID().slice(0, 8),
      userId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('products').insertOne(newProduct as any);
    } else {
      this.data.products.unshift(newProduct);
      this.persistLocalStore();
    }
    return newProduct;
  }

  public async updateProduct(
    id: string,
    userId: string,
    updateData: Partial<Omit<Product, '_id' | 'userId' | 'createdAt'>>
  ): Promise<Product | null> {
    const expiry =
      updateData.purchaseDate && updateData.warrantyDurationMonths
        ? calculateExpiry(updateData.purchaseDate, updateData.warrantyDurationMonths)
        : updateData.warrantyExpiryDate;

    const payload = {
      ...updateData,
      ...(expiry ? { warrantyExpiryDate: expiry } : {}),
      updatedAt: new Date().toISOString(),
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb
        .collection('products')
        .updateOne({ _id: id as any, userId }, { $set: payload });
      const updated = await this.getProductById(id, userId);
      return updated;
    }

    const index = this.data.products.findIndex((p) => p._id === id && p.userId === userId);
    if (index === -1) return null;

    this.data.products[index] = {
      ...this.data.products[index],
      ...payload,
    };
    this.persistLocalStore();
    return this.data.products[index];
  }

  public async deleteProduct(id: string, userId: string): Promise<boolean> {
    if (this.isConnectedToMongo && this.mongoDb) {
      const res = await this.mongoDb.collection('products').deleteOne({ _id: id as any, userId });
      return (res.deletedCount ?? 0) > 0;
    }

    const initialLength = this.data.products.length;
    this.data.products = this.data.products.filter((p) => !(p._id === id && p.userId === userId));
    const deleted = this.data.products.length < initialLength;
    if (deleted) {
      this.persistLocalStore();
    }
    return deleted;
  }
}

export const db = new DocumentStore();

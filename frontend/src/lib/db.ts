/**
 * DATABASE MANAGER - PELUM PROJECT
 * Simulates a client-side PostgreSQL database (matching db.sql schema) using localStorage.
 * This file acts as the single source of truth for the frontend app.
 */

export interface User {
  id_user: string;
  username: string;
  email: string;
  nama_lengkap: string;
  no_telp: string;
  avatar: string;
  role: "customer" | "seller" | "admin";
  created_at: string;
}

export interface Seller {
  id_seller: string;
  id_user: string;
  nm_store: string;
  deskripsi: string;
  logo_toko: string;
  email: string;
  no_telp: string;
  addr: string;
  img_ktp: string;
  nik_ktp: string;
  nib: string;
  nama_bank: string;
  no_rek: string;
  atas_nama_rek: string;
  is_verified: boolean;
  created_at: string;
}

export interface Product {
  id_produk: string;
  id_seller: string;
  nama_produk: string;
  sku: string;
  category: string;
  harga: number;
  stok: number;
  status: "Aktif" | "Stok Habis" | "Dalam Review";
  img: string;
  desc: string;
  created_at: string;
}

export interface Order {
  id_order: string;
  id_user: string;
  id_seller: string;
  item: string;
  invoice: string;
  price: number;
  status: "Pending" | "Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";
  created_at: string;
}

const DEFAULT_USERS: User[] = [
  {
    id_user: "u1-customer",
    username: "sitirahayu",
    email: "siti.rahayu@email.com",
    nama_lengkap: "Siti Rahayu",
    no_telp: "+62 812 3456 7890",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    role: "customer",
    created_at: new Date().toISOString()
  },
  {
    id_user: "u2-seller",
    username: "pakumkm",
    email: "seller@email.com",
    nama_lengkap: "Budi Santoso",
    no_telp: "+62 813 9876 5432",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    role: "seller",
    created_at: new Date().toISOString()
  },
  {
    id_user: "u3-admin",
    username: "superadmin",
    email: "admin@email.com",
    nama_lengkap: "Super Admin Pelataran",
    no_telp: "+62 811 1111 2222",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
    role: "admin",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_SELLERS: Seller[] = [
  {
    id_seller: "s1-toko",
    id_user: "u2-seller",
    nm_store: "Toko Keramik Gayo",
    deskripsi: "Sentra kerajinan mangkuk keramik dan kopi Toraja berkualitas premium.",
    logo_toko: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=100&auto=format&fit=crop",
    email: "seller@email.com",
    no_telp: "+62 813 9876 5432",
    addr: "Jl. Gayo No. 45, Banda Aceh",
    img_ktp: "ktp_budi.jpg",
    nik_ktp: "1234567890123456",
    nib: "9120001234567",
    nama_bank: "BCA",
    no_rek: "8001234567",
    atas_nama_rek: "Budi Santoso",
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id_produk: "p1",
    id_seller: "s1-toko",
    nama_produk: "Mangkuk Keramik Motif Megamendung Handmade",
    sku: "SKU-8821",
    category: "Kerajinan",
    harga: 125000,
    stok: 45,
    status: "Aktif",
    img: "/product-keramik.png",
    desc: "Mangkuk keramik buatan tangan asli dengan motif batik Megamendung Cirebon. Sangat elegan untuk dekorasi maupun alat makan mewah.",
    created_at: new Date().toISOString()
  },
  {
    id_produk: "p2",
    id_seller: "s1-toko",
    nama_produk: "Kopi Toraja Arabika 250g Premium Roasted",
    sku: "SKU-4912",
    category: "Kuliner",
    harga: 85000,
    stok: 120,
    status: "Aktif",
    img: "/product-kopi.png",
    desc: "Biji kopi pilihan Arabika dari Toraja Utara dengan level pemanggangan medium-dark. Memiliki aroma floral dan rasa yang kuat.",
    created_at: new Date().toISOString()
  },
  {
    id_produk: "p3",
    id_seller: "s1-toko",
    nama_produk: "Dompet Kulit Sapi Asli Handmade Cognac Brown",
    sku: "SKU-7731",
    category: "Fashion Pria",
    harga: 210000,
    stok: 0,
    status: "Stok Habis",
    img: "/product-dompet.png",
    desc: "Dompet lipat pria dari bahan kulit sapi asli bertipe pull-up dengan jahitan tangan yang sangat rapi dan tahan lama.",
    created_at: new Date().toISOString()
  }
];

// Helper to check if window/localStorage is available
const isBrowser = typeof window !== "undefined";

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (isBrowser) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const db = {
  // Initialize Database state in local storage
  init() {
    if (!isBrowser) return;
    if (!localStorage.getItem("pelum_users")) {
      setStorageItem("pelum_users", DEFAULT_USERS);
    }
    if (!localStorage.getItem("pelum_sellers")) {
      setStorageItem("pelum_sellers", DEFAULT_SELLERS);
    }
    if (!localStorage.getItem("pelum_products")) {
      setStorageItem("pelum_products", DEFAULT_PRODUCTS);
    }
    if (!localStorage.getItem("pelum_orders")) {
      setStorageItem("pelum_orders", []);
    }
    if (!localStorage.getItem("pelum_current_user")) {
      // Login Siti Rahayu by default to make testing easier
      setStorageItem("pelum_current_user", DEFAULT_USERS[0]);
    }
    console.log("Database initialized in LocalStorage.");
  },

  // Users
  getUsers(): User[] {
    return getStorageItem("pelum_users", DEFAULT_USERS);
  },

  registerUser(username: string, email: string, no_telp: string): User {
    const users = this.getUsers();
    const newUser: User = {
      id_user: `u-${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      nama_lengkap: username,
      no_telp,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      role: "customer",
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setStorageItem("pelum_users", users);
    return newUser;
  },

  getCurrentUser(): User | null {
    return getStorageItem<User | null>("pelum_current_user", null);
  },

  setCurrentUser(user: User | null) {
    setStorageItem("pelum_current_user", user);
    // Sync back to users array
    if (user) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id_user === user.id_user);
      if (idx !== -1) {
        users[idx] = user;
        setStorageItem("pelum_users", users);
      }
    }
  },

  authenticate(email: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  },

  logout() {
    this.setCurrentUser(null);
  },

  // Sellers
  getSellers(): Seller[] {
    return getStorageItem("pelum_sellers", DEFAULT_SELLERS);
  },

  getSellerByUserId(userId: string): Seller | null {
    const sellers = this.getSellers();
    return sellers.find(s => s.id_user === userId) || null;
  },

  registerSeller(
    userId: string,
    nm_store: string,
    email: string,
    no_telp: string,
    nib: string,
    nik_ktp: string,
    rekening: string,
    ktpFileName: string
  ): Seller {
    const sellers = this.getSellers();
    
    // Parse bank details from rekening string
    const bankParts = rekening.split("-");
    const nama_bank = bankParts[0]?.trim() || "BCA";
    const no_rek = bankParts[1]?.trim() || rekening;

    const newSeller: Seller = {
      id_seller: `s-${Math.random().toString(36).substr(2, 9)}`,
      id_user: userId,
      nm_store,
      deskripsi: `Selamat datang di ${nm_store}`,
      logo_toko: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=100&auto=format&fit=crop",
      email,
      no_telp,
      addr: "Indonesia",
      img_ktp: ktpFileName,
      nik_ktp,
      nib,
      nama_bank,
      no_rek,
      atas_nama_rek: "Pemilik Toko",
      is_verified: false, // Must be verified by superadmin
      created_at: new Date().toISOString()
    };
    
    sellers.push(newSeller);
    setStorageItem("pelum_sellers", sellers);

    // Update user role to seller
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id_user === userId);
    if (userIdx !== -1) {
      users[userIdx].role = "seller";
      setStorageItem("pelum_users", users);
      // Update active current user too
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id_user === userId) {
        currentUser.role = "seller";
        this.setCurrentUser(currentUser);
      }
    }

    return newSeller;
  },

  verifySeller(sellerId: string, isVerified: boolean): void {
    const sellers = this.getSellers();
    const idx = sellers.findIndex(s => s.id_seller === sellerId);
    if (idx !== -1) {
      sellers[idx].is_verified = isVerified;
      setStorageItem("pelum_sellers", sellers);
    }
  },

  // Products
  getProducts(): Product[] {
    return getStorageItem("pelum_products", DEFAULT_PRODUCTS);
  },

  getProductsBySeller(sellerId: string): Product[] {
    const products = this.getProducts();
    return products.filter(p => p.id_seller === sellerId);
  },

  addProduct(
    sellerId: string,
    nama_produk: string,
    category: string,
    harga: number,
    stok: number,
    desc: string,
    status: "Aktif" | "Stok Habis" | "Dalam Review" = "Aktif"
  ): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      id_produk: `p-${Math.random().toString(36).substr(2, 9)}`,
      id_seller: sellerId,
      nama_produk,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      harga,
      stok,
      status,
      img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop",
      desc,
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    setStorageItem("pelum_products", products);
    return newProduct;
  },

  deleteProduct(sku: string): void {
    const products = this.getProducts();
    const updated = products.filter(p => p.sku !== sku);
    setStorageItem("pelum_products", updated);
  },

  // Orders
  getOrders(): Order[] {
    return getStorageItem("pelum_orders", []);
  },

  getOrdersByUser(userId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(o => o.id_user === userId);
  }
};

// Auto-initialize when imported in the browser
if (isBrowser) {
  db.init();
}
